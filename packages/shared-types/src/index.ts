// ==============================================================================
// Tender Corrigendum & Amendment Tracker - Shared TypeScript Contracts
// ==============================================================================

export type RoleName = 'SUPER_ADMIN' | 'REVIEWER' | 'REGISTERED_USER' | 'SYSTEM_AGENT';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
export type TenderStatus = 'DRAFT' | 'PUBLISHED' | 'AMENDED' | 'CLOSED' | 'AWARDED' | 'CANCELLED' | 'UNKNOWN';

export type AmendmentType =
  | 'DEADLINE_EXTENSION'
  | 'ELIGIBILITY_CRITERIA'
  | 'FINANCIAL_TERMS'
  | 'TECHNICAL_SPECIFICATION'
  | 'DOCUMENT_CORRECTION'
  | 'MEETING_SCHEDULE'
  | 'CANCELLATION'
  | 'REOPENING'
  | 'OTHER';

export type ReviewStatus = 'DISCOVERED' | 'PROCESSING' | 'NEEDS_REVIEW' | 'APPROVED' | 'REJECTED' | 'FAILED' | 'REVOKED';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'MANUALLY_CORRECTED';
export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'WEBHOOK';
export type NotificationStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ';

export interface UserDto {
  id: string;
  email: string;
  name: string;
  status: UserStatus;
  roles: RoleName[];
  createdAt: string;
}

export interface AuthResponseDto {
  user: UserDto;
  accessToken: string;
}

export interface DocumentEvidence {
  documentId?: string;
  pageNumber: number;
  paragraph?: string;
  excerpt: string;
  boundingBox?: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

export interface AmendmentChangeDto {
  id: string;
  amendmentId: string;
  fieldKey: string;
  changeType: 'MODIFIED' | 'ADDED' | 'REMOVED';
  oldValue: string | null;
  newValue: string | null;
  confidence: number;
  evidence: DocumentEvidence | null;
  verificationStatus: VerificationStatus;
}

export interface AmendmentDto {
  id: string;
  tenderId: string;
  sourceAmendmentRef?: string | null;
  amendmentNumber: string;
  title: string | null;
  description: string | null;
  publicationDate: string | null;
  amendmentType: AmendmentType;
  reviewStatus: ReviewStatus;
  sourceUrl?: string | null;
  changes?: AmendmentChangeDto[];
  createdAt: string;
}

export interface TenderVersionDto {
  id: string;
  tenderId: string;
  versionNumber: number;
  eventType: string;
  snapshotJson: Record<string, unknown>;
  createdBy?: string | null;
  createdAt: string;
}

export interface TenderDto {
  id: string;
  tenderNumber: string;
  normalizedTenderNumber: string;
  sourceTenderRef?: string | null;
  title: string;
  organizationName?: string;
  departmentName?: string;
  status: TenderStatus;
  publicationDate: string | null;
  submissionDeadline: string | null;
  currency: string;
  estimatedValue: number | null;
  category?: string | null;
  location?: string | null;
  sourceUrl?: string | null;
  versions?: TenderVersionDto[];
  amendments?: AmendmentDto[];
  isFollowed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown[];
    requestId: string;
    timestamp: string;
  };
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

