package edu.knust.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ModerationEngineResponse(
        String action,
        boolean urgent,
        List<String> triggered_categories,
        Map<String, Double> category_scores,
        Double overall_risk_score,
        String priority_tier,
        String post_status,
        List<String> flagged_reasons,
        List<String> context_overrides,
        Boolean safe,
        Integer vulgarity_word_count,
        Double vulgarity_density_ratio,
        JsonNode highlight_spans
) {}
