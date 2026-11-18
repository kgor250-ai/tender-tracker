import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReviewStatus, VerificationStatus } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async submitReview(
    amendmentId: string,
    reviewerId: string,
    payload: {
      decision: 'APPROVE' | 'REJECT' | 'NEEDS_CORRECTION';
      notes?: string;
      reviewedChanges?: Array<{ changeId: string; status: VerificationStatus; editedValue?: string }>;
    }
  ) {
    const amendment = await this.prisma.amendment.findUnique({
      where: { id: amendmentId },
      include: { tender: true, changes: true },
    });

    if (!amendment) {
      throw new NotFoundException({
        code: 'AMENDMENT_NOT_FOUND',
        message: `Amendment with ID ${amendmentId} not found`,
      });
    }

    if (payload.decision === 'REJECT') {
      return this.prisma.$transaction(async (tx) => {
        await tx.reviewRecord.create({
          data: {
            amendmentId,
            reviewerId,
            decision: 'REJECT',
            notes: payload.notes || 'Rejected by reviewer.',
          },
        });

        return tx.amendment.update({
          where: { id: amendmentId },
          data: { reviewStatus: ReviewStatus.REJECTED },
        });
      });
    }

    if (payload.decision === 'APPROVE') {
      return this.prisma.$transaction(async (tx) => {
        // 1. Update verification status on individual changes
        if (payload.reviewedChanges) {
          for (const item of payload.reviewedChanges) {
            await tx.amendmentChange.update({
              where: { id: item.changeId },
              data: {
                verificationStatus: item.status,
                newValue: item.editedValue !== undefined ? item.editedValue : undefined,
              },
            });
          }
        }

        // 2. Mark Amendment Approved
        const approvedAmendment = await tx.amendment.update({
          where: { id: amendmentId },
          data: { reviewStatus: ReviewStatus.APPROVED },
        });

        // 3. Record Review Decision
        await tx.reviewRecord.create({
          data: {
            amendmentId,
            reviewerId,
            decision: 'APPROVE',
            notes: payload.notes || 'Approved following review verification.',
          },
        });

        // 4. Update Tender Master active values based on verified changes
        const latestChanges = await tx.amendmentChange.findMany({
          where: { amendmentId, verificationStatus: { in: ['VERIFIED', 'MANUALLY_CORRECTED'] } },
        });

        const tenderUpdateData: any = { status: 'AMENDED' };
        for (const change of latestChanges) {
          if (change.fieldKey === 'submissionDeadline' && change.newValue) {
            tenderUpdateData.submissionDeadline = new Date(change.newValue);
          }
          if (change.fieldKey === 'estimatedValue' && change.newValue) {
            tenderUpdateData.estimatedValue = parseFloat(change.newValue);
          }
        }

        await tx.tender.update({
          where: { id: amendment.tenderId },
          data: tenderUpdateData,
        });

        // 5. Append Immutable TenderVersion Snapshot
        const latestVersion = await tx.tenderVersion.findFirst({
          where: { tenderId: amendment.tenderId },
          orderBy: { versionNumber: 'desc' },
        });
        const nextVersionNum = (latestVersion?.versionNumber || 1) + 1;

        await tx.tenderVersion.create({
          data: {
            tenderId: amendment.tenderId,
            versionNumber: nextVersionNum,
            eventType: 'CORRIGENDUM_APPLIED',
            snapshotJson: {
              tenderNumber: amendment.tender.tenderNumber,
              title: amendment.tender.title,
              appliedAmendmentId: amendment.id,
              amendmentNumber: amendment.amendmentNumber,
              submissionDeadline: tenderUpdateData.submissionDeadline || amendment.tender.submissionDeadline,
              verifiedChanges: latestChanges.map((c) => ({
                fieldKey: c.fieldKey,
                newValue: c.newValue,
              })),
            },
            createdBy: reviewerId,
          },
        });

        // 6. Queue Notifications for Tender Followers
        const followers = await tx.followedTender.findMany({
          where: { tenderId: amendment.tenderId },
        });

        for (const follower of followers) {
          await tx.notification.create({
            data: {
              userId: follower.userId,
              amendmentId: amendment.id,
              channel: 'IN_APP',
              status: 'SENT',
              subject: `Corrigendum Approved: ${amendment.amendmentNumber} for ${amendment.tender.tenderNumber}`,
              payloadJson: {
                tenderId: amendment.tenderId,
                tenderNumber: amendment.tender.tenderNumber,
                amendmentNumber: amendment.amendmentNumber,
                title: amendment.title,
              },
            },
          });
        }

        return {
          amendmentId: approvedAmendment.id,
          reviewStatus: ReviewStatus.APPROVED,
          newVersionNumber: nextVersionNum,
          notificationsSent: followers.length,
        };
      });
    }

    throw new BadRequestException('Invalid review decision.');
  }
}

