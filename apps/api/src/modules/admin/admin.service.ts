import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async listSources() {
    return this.prisma.portalSource.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { collectionJobs: true, tenders: true } },
      },
    });
  }

  async listCollectionJobs() {
    return this.prisma.collectionJob.findMany({
      orderBy: { startedAt: 'desc' },
      take: 20,
      include: { source: true },
    });
  }

  async getAnalyticsOverview() {
    const [totalTenders, totalAmendments, pendingReview, auditCount] = await Promise.all([
      this.prisma.tender.count(),
      this.prisma.amendment.count(),
      this.prisma.amendment.count({ where: { reviewStatus: 'NEEDS_REVIEW' } }),
      this.prisma.auditLog.count(),
    ]);

    const amendmentsByType = await this.prisma.amendment.groupBy({
      by: ['amendmentType'],
      _count: { id: true },
    });

    return {
      totalTenders,
      totalAmendments,
      pendingReview,
      auditCount,
      amendmentsByType: amendmentsByType.map((item) => ({
        type: item.amendmentType,
        count: item._count.id,
      })),
    };
  }

  async getAuditLogs(params: { actorId?: string; resourceType?: string; limit?: number }) {
    const limit = Math.min(Number(params.limit) || 50, 100);
    const where: any = {};
    if (params.actorId) where.actorId = params.actorId;
    if (params.resourceType) where.resourceType = params.resourceType;

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
    });
  }
}

