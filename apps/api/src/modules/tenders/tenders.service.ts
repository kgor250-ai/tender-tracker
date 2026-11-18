import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenderStatus } from '@prisma/client';

@Injectable()
export class TendersService {
  constructor(private prisma: PrismaService) {}

  normalizeTenderNumber(num: string): string {
    return num.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }

  async search(params: {
    query?: string;
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(params.page) || 1;
    const limit = Math.min(Number(params.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) {
      where.status = params.status as TenderStatus;
    }
    if (params.category) {
      where.category = { contains: params.category, mode: 'insensitive' };
    }
    if (params.query) {
      const q = params.query.trim();
      where.OR = [
        { tenderNumber: { contains: q, mode: 'insensitive' } },
        { normalizedTenderNumber: { contains: this.normalizeTenderNumber(q), mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.tender.count({ where }),
      this.prisma.tender.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publicationDate: 'desc' },
        include: {
          department: { include: { organization: true } },
          _count: { select: { amendments: true, followers: true } },
        },
      }),
    ]);

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const tender = await this.prisma.tender.findUnique({
      where: { id },
      include: {
        department: { include: { organization: true } },
        amendments: {
          orderBy: { publicationDate: 'asc' },
          include: {
            changes: true,
            documents: true,
            analyses: true,
          },
        },
        documents: true,
        versions: { orderBy: { versionNumber: 'desc' } },
      },
    });

    if (!tender) {
      throw new NotFoundException({
        code: 'TENDER_NOT_FOUND',
        message: `Tender with ID ${id} not found`,
      });
    }

    return tender;
  }

  async getTimeline(id: string) {
    const tender = await this.findById(id);

    const timelineEvents = [
      {
        id: `init-${tender.id}`,
        type: 'INITIAL_NOTICE',
        title: 'Original Notice Inviting Tender (NIT) Published',
        date: tender.publicationDate,
        status: 'PUBLISHED',
        details: {
          tenderNumber: tender.tenderNumber,
          initialDeadline: tender.submissionDeadline,
          estimatedValue: tender.estimatedValue,
          currency: tender.currency,
        },
      },
      ...tender.amendments.map((amd) => ({
        id: amd.id,
        type: 'CORRIGENDUM',
        title: amd.title || amd.amendmentNumber,
        amendmentNumber: amd.amendmentNumber,
        date: amd.publicationDate || amd.createdAt,
        status: amd.reviewStatus,
        amendmentType: amd.amendmentType,
        changes: amd.changes,
        analysis: amd.analyses[0] || null,
      })),
    ];

    timelineEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      tenderId: tender.id,
      tenderNumber: tender.tenderNumber,
      currentStatus: tender.status,
      activeSubmissionDeadline: tender.submissionDeadline,
      events: timelineEvents,
    };
  }

  async getVersions(id: string) {
    await this.findById(id);
    return this.prisma.tenderVersion.findMany({
      where: { tenderId: id },
      orderBy: { versionNumber: 'desc' },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }

  async create(payload: any, userId?: string) {
    const normalized = this.normalizeTenderNumber(payload.tenderNumber);

    const existing = await this.prisma.tender.findFirst({
      where: { normalizedTenderNumber: normalized },
    });

    if (existing) {
      throw new ConflictException({
        code: 'DUPLICATE_RESOURCE',
        message: `Tender with number ${payload.tenderNumber} already exists.`,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const tender = await tx.tender.create({
        data: {
          tenderNumber: payload.tenderNumber,
          normalizedTenderNumber: normalized,
          title: payload.title,
          sourceTenderRef: payload.sourceTenderRef || null,
          status: 'PUBLISHED',
          publicationDate: payload.publicationDate ? new Date(payload.publicationDate) : new Date(),
          submissionDeadline: payload.submissionDeadline ? new Date(payload.submissionDeadline) : null,
          estimatedValue: payload.estimatedValue ? Number(payload.estimatedValue) : null,
          currency: payload.currency || 'INR',
          category: payload.category || 'General',
          location: payload.location || 'India',
          sourceUrl: payload.sourceUrl || null,
        },
      });

      // Immutable version snapshot 1
      await tx.tenderVersion.create({
        data: {
          tenderId: tender.id,
          versionNumber: 1,
          eventType: 'INITIAL_PUBLICATION',
          snapshotJson: {
            tenderNumber: tender.tenderNumber,
            title: tender.title,
            status: tender.status,
            submissionDeadline: tender.submissionDeadline,
            estimatedValue: tender.estimatedValue,
            currency: tender.currency,
          },
          createdBy: userId || null,
        },
      });

      return tender;
    });
  }

  async follow(tenderId: string, userId: string) {
    await this.findById(tenderId);
    return this.prisma.followedTender.upsert({
      where: { userId_tenderId: { userId, tenderId } },
      update: {},
      create: {
        userId,
        tenderId,
        notificationPreferencesJson: { inApp: true, email: true },
      },
    });
  }

  async unfollow(tenderId: string, userId: string) {
    return this.prisma.followedTender.deleteMany({
      where: { userId, tenderId },
    });
  }
}

