"""
Corrigendum Classification Agent
Categorizes amendments into standardized procurement types based on extracted terminology and keywords.
"""

from typing import List, Tuple


class CorrigendumClassifier:
    CATEGORY_KEYWORDS = {
        "DEADLINE_EXTENSION": [
            "extend", "extension", "last date", "submission date", "due date",
            "time extension", "revised schedule", "bid submission"
        ],
        "ELIGIBILITY_CRITERIA": [
            "eligibility", "qualification", "turnover", "experience", "pre-qualification",
            "net worth", "empanelment", "joint venture", "consortium"
        ],
        "FINANCIAL_TERMS": [
            "emd", "earnest money", "tender fee", "payment terms", "bank guarantee",
            "security deposit", "price variation", "bill of quantities", "boq"
        ],
        "TECHNICAL_SPECIFICATION": [
            "specification", "technical parameter", "make", "brand", "model",
            "drawing", "grade", "mix design", "bitumen", "asphalt", "concrete"
        ],
        "MEETING_SCHEDULE": [
            "pre-bid", "meeting", "conference", "clarification meeting", "venue"
        ],
        "CANCELLATION": [
            "cancel", "cancelled", "cancellation", "retender", "scrapped", "annulled"
        ],
        "REOPENING": [
            "re-open", "reopened", "recall", "reinstate"
        ]
    }

    def classify(self, text: str) -> Tuple[str, float]:
        text_lower = text.lower()
        scores = {}

        for category, keywords in self.CATEGORY_KEYWORDS.items():
            matches = sum(1 for kw in keywords if kw in text_lower)
            if matches > 0:
                scores[category] = matches

        if not scores:
            return "OTHER", 0.50

        # Best matching category
        best_category = max(scores, key=scores.get)
        confidence = min(0.60 + (scores[best_category] * 0.12), 0.98)

        return best_category, round(confidence, 2)

