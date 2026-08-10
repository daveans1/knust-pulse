package edu.knust.backend.dto;

import java.util.Map;

public record AnalyticsSummary(
        long totalAnalyzed,
        long autoApproved,
        double flagRate,
        long urgentCount,
        long highRiskCount,
        long mediumRiskCount,
        long approvedCount,
        double avgRiskScore,
        Map<String, Long> categoryBreakdown
) {}
