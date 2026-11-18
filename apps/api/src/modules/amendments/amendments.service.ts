import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AmendmentType, ReviewStatus } from '@prisma/client';

@Injectable()
export class AmendmentsService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const amendment = await this.prisma.amendment.findUnique({
      where: { id },
      include: {
        tender: true,
        changes: true,
        documents: true,
        reviewRecords: { include: { reviewer: true } },
        analyses: true,
      },
    });

    if (!amendment) {
      throw new NotFoundException({
        code: 'AMENDMENT_NOT_FOUND',
        message: `Amendment with ID ${id} not found`,
      });
    }

    return amendment;
  }

  async create(tenderId: string, payload: any) {
    const tender = await this.prisma.tender.findUnique({ where: { id: tenderId } });
    if (!tender) {
      throw new NotFoundException({
        code: 'TENDER_NOT_FOUND',
        message: `Tender with ID ${tenderId} not found`,
      });
    }

    return this.prisma.amendment.create({
      data: {
        tenderId,
        amendmentNumber: payload.amendmentNumber || 'Corrigendum Notice',
        title: payload.title || 'Amendment Notice',
        description: payload.description || '',
        publicationDate: payload.publicationDate ? new Date(payload.publicationDate) : new Date(),
        amendmentType: (payload.amendmentType as AmendmentType) || 'OTHER',
        reviewStatus: ReviewStatus.PROCESSING,
        sourceUrl: payload.sourceUrl || null,
        sourceAmendmentRef: payload.sourceAmendmentRef || null,
      },
    });
  }

  async getChanges(id: string) {
    await this.findById(id);
    return this.prisma.amendmentChange.findMany({
      where: { amendmentId: id },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getComparison(id: string) {
    const amendment = await this.findById(id);
    const tender = amendment.tender;

    return {
      amendmentId: amendment.id,
      amendmentNumber: amendment.amendmentNumber,
      tenderNumber: tender.tenderNumber,
      tenderTitle: tender.title,
      reviewStatus: amendment.reviewStatus,
      changes: amendment.changes.map((c) => ({
        fieldKey: c.fieldKey,
        changeType: c.changeType,
        oldValue: c.oldValue,
        newValue: c.newValue,
        confidence: c.confidence,
        evidence: c.evidenceJson,
        verificationStatus: c.verificationStatus,
      })),
    };
  }

  async triggerProcess(id: string) {
    const amendment = await this.findById(id);
    // In production, pushes BullMQ job to Redis
    // For demo/standalone, transitions status to NEEDS_REVIEW
    return this.prisma.amendment.update({
      where: { id },
      data: { reviewStatus: ReviewStatus.NEEDS_REVIEW },
    });
  }
}

