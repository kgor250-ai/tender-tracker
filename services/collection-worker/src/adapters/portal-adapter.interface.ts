export interface PortalCandidateTender {
  sourceTenderRef: string;
  tenderNumber: string;
  title: string;
  organizationName: string;
  departmentName: string;
  publicationDate: string;
  submissionDeadline: string;
  estimatedValue?: number;
  currency?: string;
  sourceUrl: string;
  category?: string;
}

export interface PortalCandidateAmendment {
  sourceTenderRef: string;
  sourceAmendmentRef: string;
  amendmentNumber: string;
  title: string;
  publicationDate: string;
  sourceUrl: string;
  documentUrls: string[];
}

export interface TenderPortalAdapter {
  readonly adapterKey: string;
  readonly name: string;

  validateConfiguration(config: Record<string, unknown>): boolean;
  fetchListings(since?: Date): Promise<PortalCandidateTender[]>;
  fetchCorrigenda(tenderRef: string): Promise<PortalCandidateAmendment[]>;
  downloadDocument(documentUrl: string): Promise<{ buffer: Buffer; mimeType: string; filename: string }>;
}

