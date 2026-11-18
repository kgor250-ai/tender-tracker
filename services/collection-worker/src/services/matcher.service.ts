/**
 * Tender Matching Service
 * Matches ingested candidate notices to existing tenders using normalized numbers,
 * source references, and title similarity.
 */

export class TenderMatchingService {
  normalizeTenderNumber(tenderNumber: string): string {
    return tenderNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }

  calculateMatchScore(
    candidate: { tenderNumber?: string; title: string; sourceTenderRef?: string },
    existing: { normalizedTenderNumber: string; title: string; sourceTenderRef?: string | null }
  ): { confidence: number; isUncertain: boolean } {
    // 1. Direct normalized tender number match
    if (candidate.tenderNumber) {
      const candidateNorm = this.normalizeTenderNumber(candidate.tenderNumber);
      if (candidateNorm === existing.normalizedTenderNumber) {
        return { confidence: 1.0, isUncertain: false };
      }
    }

    // 2. Source reference match
    if (candidate.sourceTenderRef && existing.sourceTenderRef) {
      if (candidate.sourceTenderRef.trim() === existing.sourceTenderRef.trim()) {
        return { confidence: 0.98, isUncertain: false };
      }
    }

    // 3. Title string containment
    const cleanCandTitle = candidate.title.toLowerCase().trim();
    const cleanExistTitle = existing.title.toLowerCase().trim();

    if (cleanCandTitle.includes(cleanExistTitle) || cleanExistTitle.includes(cleanCandTitle)) {
      return { confidence: 0.82, isUncertain: true };
    }

    return { confidence: 0.0, isUncertain: true };
  }
}

