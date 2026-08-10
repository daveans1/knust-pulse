package edu.knust.backend.dto;

public record ModerationServiceResponse(
        double score,
        String flaggedReason,
        String action,
        String source
) {}
