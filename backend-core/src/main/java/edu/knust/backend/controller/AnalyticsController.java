package edu.knust.backend.controller;

import edu.knust.backend.dto.AnalyticsSummary;
import edu.knust.backend.model.PostStatus;
import edu.knust.backend.repository.PostRepository;
import edu.knust.backend.repository.ReportRepository;
import edu.knust.backend.repository.ModerationLogRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import edu.knust.backend.dto.UserSummary;
import edu.knust.backend.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final PostRepository posts;
    private final ReportRepository reports;
    private final UserRepository users;

    private final ModerationLogRepository moderationLogs;

    public AnalyticsController(PostRepository posts, ReportRepository reports, UserRepository users, ModerationLogRepository moderationLogs) {
        this.posts = posts;
        this.reports = reports;
        this.users = users;
        this.moderationLogs = moderationLogs;
    }

    @GetMapping("/summary")
    public AnalyticsSummary summary() {
        var logs = moderationLogs.findAll();
        long totalAnalyzed = logs.size();
        
        long autoApproved = 0;
        long urgentCount = 0;
        long highRiskCount = 0;
        long mediumRiskCount = 0;
        
        double totalScore = 0.0;
        java.util.Map<String, Long> categoryBreakdown = new java.util.HashMap<>();
        categoryBreakdown.put("severe_harm", 0L);
        categoryBreakdown.put("harassment", 0L);
        categoryBreakdown.put("vulgarity", 0L);
        categoryBreakdown.put("spam", 0L);

        for (var log : logs) {
            double score = log.getAiScore() == null ? 0.0 : log.getAiScore().doubleValue();
            totalScore += score;
            
            // Map ai_score back to tier counts (based on Python engine scoring)
            if (score >= 85.0) {
                // Remove / Urgent
                if (log.getFlaggedReason() != null && (log.getFlaggedReason().toLowerCase().contains("doxxing") || log.getFlaggedReason().toLowerCase().contains("self-harm"))) {
                    urgentCount++;
                } else {
                    highRiskCount++;
                }
            } else if (score >= 65.0) {
                mediumRiskCount++; // Hide & Review
            } else if (score >= 40.0) {
                mediumRiskCount++;
            } else {
                autoApproved++;
            }

            // Category breakdown parsing (dumb parsing from flagged_reason)
            if (log.getFlaggedReason() != null) {
                String reason = log.getFlaggedReason().toLowerCase();
                if (reason.contains("self-harm") || reason.contains("violence") || reason.contains("doxxing")) {
                    categoryBreakdown.put("severe_harm", categoryBreakdown.get("severe_harm") + 1);
                }
                if (reason.contains("harassment") || reason.contains("insult") || reason.contains("threat")) {
                    categoryBreakdown.put("harassment", categoryBreakdown.get("harassment") + 1);
                }
                if (reason.contains("vulgarity") || reason.contains("profanity")) {
                    categoryBreakdown.put("vulgarity", categoryBreakdown.get("vulgarity") + 1);
                }
                if (reason.contains("spam") || reason.contains("fraud")) {
                    categoryBreakdown.put("spam", categoryBreakdown.get("spam") + 1);
                }
            }
        }

        double avgRiskScore = totalAnalyzed == 0 ? 0.0 : totalScore / totalAnalyzed;
        // In this context, "approvedCount" is same as autoApproved + manually approved
        long approvedCount = autoApproved;
        
        long flaggedTotal = urgentCount + highRiskCount + mediumRiskCount;
        double flagRate = totalAnalyzed == 0 ? 0.0 : ((double) flaggedTotal / (double) totalAnalyzed) * 100.0;

        return new AnalyticsSummary(
                totalAnalyzed,
                autoApproved,
                flagRate,
                urgentCount,
                highRiskCount,
                mediumRiskCount,
                approvedCount,
                avgRiskScore,
                categoryBreakdown
        );
    }

    @GetMapping("/violators")
    public List<UserSummary> violators() {
        return users.findTopViolators(PageRequest.of(0, 50))
                .stream()
                .map(ApiMapper::user)
                .toList();
    }
}
