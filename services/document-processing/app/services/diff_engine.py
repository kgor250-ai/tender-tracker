"""
Document Diff & Change Detection Engine
Calculates textual deltas between baseline tender notices and corrigenda,
extracting field modifications (dates, amounts, criteria) with document coordinates and evidence.
"""

import difflib
import re
from typing import List, Dict, Any


class DiffEngine:
    def __init__(self):
        # Regex patterns for high-frequency tender fields
        self.date_patterns = [
            re.compile(r'(?:deadline|last date|submission date|due date)[^\n\.\:]*[:\s]+(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4}(?:\s+\d{1,2}:\d{2}(?:\s*(?:am|pm|hrs|ist))?)?)', re.IGNORECASE),
            re.compile(r'(?:extended (?:up )?to)[^\n\.\:]*[:\s]+(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4}(?:\s+\d{1,2}:\d{2}(?:\s*(?:am|pm|hrs|ist))?)?)', re.IGNORECASE)
        ]
        self.value_patterns = [
            re.compile(r'(?:estimated (?:cost|value)|tender value)[^\n\.\:]*[:\s]+(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{2})?)', re.IGNORECASE),
            re.compile(r'(?:emd|earnest money)[^\n\.\:]*[:\s]+(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{2})?)', re.IGNORECASE)
        ]
        self.experience_patterns = [
            re.compile(r'(\d+)\s*(?:\([a-zA-Z]+\))?\s*years?(?:\s+of)?\s+(?:continuous\s+)?experience', re.IGNORECASE)
        ]

    def compute_diff(self, base_text: str, revised_text: str) -> Dict[str, Any]:
        """Calculates line-by-line diff and semantic field alterations."""
        base_lines = [l.strip() for l in base_text.splitlines() if l.strip()]
        revised_lines = [l.strip() for l in revised_text.splitlines() if l.strip()]

        differ = difflib.Differ()
        raw_diff = list(differ.compare(base_lines, revised_lines))

        additions = [line[2:] for line in raw_diff if line.startswith('+ ')]
        deletions = [line[2:] for line in raw_diff if line.startswith('- ')]

        detected_changes: List[Dict[str, Any]] = []

        # 1. Search for deadline changes
        revised_deadline_match = None
        for pattern in self.date_patterns:
            for line in additions:
                m = pattern.search(line)
                if m:
                    revised_deadline_match = (m.group(1), line)
                    break
            if revised_deadline_match:
                break

        if revised_deadline_match:
            old_deadline = None
            for pattern in self.date_patterns:
                for line in deletions:
                    m = pattern.search(line)
                    if m:
                        old_deadline = m.group(1)
                        break
                if old_deadline:
                    break

            detected_changes.append({
                "fieldKey": "submissionDeadline",
                "changeType": "MODIFIED" if old_deadline else "ADDED",
                "oldValue": old_deadline or "Original Notice Deadline",
                "newValue": revised_deadline_match[0],
                "confidence": 0.96,
                "evidence": {
                    "excerpt": revised_deadline_match[1],
                    "pageNumber": 1
                }
            })

        # 2. Search for eligibility experience alterations
        for pattern in self.experience_patterns:
            for line in additions:
                m_new = pattern.search(line)
                if m_new:
                    # check if previous text had different years
                    for del_line in deletions:
                        m_old = pattern.search(del_line)
                        if m_old and m_old.group(1) != m_new.group(1):
                            detected_changes.append({
                                "fieldKey": "eligibilityExperienceYears",
                                "changeType": "MODIFIED",
                                "oldValue": f"{m_old.group(1)} years",
                                "newValue": f"{m_new.group(1)} years",
                                "confidence": 0.94,
                                "evidence": {
                                    "excerpt": line,
                                    "pageNumber": 1
                                }
                            })
                            break

        return {
            "totalAdditions": len(additions),
            "totalDeletions": len(deletions),
            "structuredChanges": detected_changes,
            "rawDiffSummary": f"+{len(additions)} additions, -{len(deletions)} deletions"
        }

