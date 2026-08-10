package edu.knust.backend.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import java.util.Map;

public record ModerationEngineResponse(
        String action,
        boolean urgent,
        List<String> triggered_categories,
        Map<String, Double> category_scores,
        Double overall_risk_score,
        String priority_tier,
        JsonNode highlight_spans
) {}
