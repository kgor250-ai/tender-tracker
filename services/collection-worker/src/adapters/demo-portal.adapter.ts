import { TenderPortalAdapter, PortalCandidateTender, PortalCandidateAmendment } from './portal-adapter.interface';

export class DemoPortalAdapter implements TenderPortalAdapter {
  readonly adapterKey = 'demo-portal-adapter';
  readonly name = 'Demo Public Procurement Portal Adapter';

  validateConfiguration(config: Record<string, unknown>): boolean {
    return Boolean(config);
  }

  async fetchListings(since?: Date): Promise<PortalCandidateTender[]> {
    // Simulated permitted listing extraction with rate limit respect
    return [
      {
        sourceTenderRef: 'PORTAL-DEMO-2026-9901',
        tenderNumber: 'DEMO/PWD/2026/001',
        title: 'Demonstration road maintenance and widening works - Sector 4 to 8 Corridor',
        organizationName: 'Demo Public Works Organization',
        departmentName: 'Demo Public Works Department',
        publicationDate: '2026-11-10T09:00:00+05:30',
        submissionDeadline: '2026-11-20T17:00:00+05:30',
        estimatedValue: 5000000.0,
        currency: 'INR',
        sourceUrl: 'https://eprocure.demo.gov.in/notice/DEMO-PWD-2026-001',
        category: 'Civil Works',
      },
    ];
  }

  async fetchCorrigenda(tenderRef: string): Promise<PortalCandidateAmendment[]> {
    if (tenderRef === 'PORTAL-DEMO-2026-9901') {
      return [
        {
          sourceTenderRef: 'PORTAL-DEMO-2026-9901',
          sourceAmendmentRef: 'CORR-01-DEMO-9901',
          amendmentNumber: 'Corrigendum 01',
          title: 'Extension of Online Bid Submission Deadline',
          publicationDate: '2026-11-13T11:00:00+05:30',
          sourceUrl: 'https://eprocure.demo.gov.in/notice/DEMO-PWD-2026-001/corr1',
          documentUrls: ['https://eprocure.demo.gov.in/docs/corr1.pdf'],
        },
      ];
    }
    return [];
  }

  async downloadDocument(documentUrl: string): Promise<{ buffer: Buffer; mimeType: string; filename: string }> {
    return {
      buffer: Buffer.from('%PDF-1.4 Mock Document Content'),
      mimeType: 'application/pdf',
      filename: 'corrigendum_notice.pdf',
    };
  }
}

