package edu.knust.backend.controller;

import edu.knust.backend.dto.ModerationDecisionRequest;
import edu.knust.backend.dto.ModerationQueueItem;
import edu.knust.backend.entity.ModerationLog;
import edu.knust.backend.entity.Post;
import edu.knust.backend.entity.User;
import edu.knust.backend.model.PostStatus;
import edu.knust.backend.repository.ModerationLogRepository;
import edu.knust.backend.repository.PostRepository;
import edu.knust.backend.service.ModerationClient;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@RestController
@RequestMapping("/api/moderation")
public class ModerationController {

    private final PostRepository posts;
    private final ModerationLogRepository logs;
    private final ModerationClient moderationClient;
    private final edu.knust.backend.repository.UserRepository users;

    public ModerationController(PostRepository posts, ModerationLogRepository logs, ModerationClient moderationClient, edu.knust.backend.repository.UserRepository users) {
        this.posts = posts;
        this.logs = logs;
        this.moderationClient = moderationClient;
        this.users = users;
    }

    @GetMapping("/queue")
    public List<ModerationQueueItem> queue() {
        return posts.findByStatusesWithAuthor(List.of(PostStatus.PENDING, PostStatus.FLAGGED)).stream()
                .map(this::toQueueItem)
                .toList();
    }

    @PatchMapping("/posts/{postId}/decision")
    public ModerationQueueItem decide(
            @PathVariable @NonNull Long postId,
            @RequestBody ModerationDecisionRequest request,
            @AuthenticationPrincipal User reviewer) {
        Post post = posts.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        PostStatus nextStatus = parseDecision(request.decision());
        post.setStatus(nextStatus);
        
        if (nextStatus == PostStatus.REMOVED && post.getAuthor() != null) {
            User author = post.getAuthor();
            if (author.getRole() != edu.knust.backend.model.UserRole.ADMIN_STAFF && author.getRole() != edu.knust.backend.model.UserRole.PROJECT_STAFF) {
                int currentViolations = author.getViolationCount() != null ? author.getViolationCount() : 0;
                author.setViolationCount(currentViolations + 1);
                
                if (author.getViolationCount() >= 3) {
                    author.setSuspendedUntil(LocalDateTime.now().plusDays(7));
                    author.setViolationCount(0); // Reset after suspension
                }
                users.save(author);
            }
        }
        
        Post saved = posts.save(post);

        Optional<ModerationLog> previous = logs.findTopByPostOrderByCreatedAtDesc(post);
        ModerationLog audit = new ModerationLog();
        audit.setPost(saved);
        audit.setAiScore(previous.map(ModerationLog::getAiScore).orElse(BigDecimal.ZERO));
        audit.setFlaggedReason("Manual decision: " + nextStatus.name());
        audit.setReviewedBy(reviewer);
        audit.setFinalDecision(nextStatus);
        audit.setCreatedAt(LocalDateTime.now());
        logs.save(audit);

        // Feed human decision back to the ML pipeline for layer 7 learning
        String originalAction = previous.map(ModerationLog::getFlaggedReason).orElse("UNKNOWN");
        moderationClient.sendFeedback(post.getContent(), nextStatus.name(), originalAction);

        return toQueueItem(saved);
    }

    /** Proxy endpoint for the Safety page Content Analysis Playground.
     *  Runs the ML pipeline on arbitrary text without creating a post. */
    @PostMapping("/analyze")
    public edu.knust.backend.dto.ModerationEngineResponse analyze(@RequestBody java.util.Map<String, Object> body) {
        String text = body.getOrDefault("text", "").toString();
        if (text.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Text is required");
        }
        String authorId = body.getOrDefault("author_id", "anonymous").toString();
        edu.knust.backend.dto.ModerationEngineResponse result = moderationClient.moderateText(text, null, 0, false);
        if (result == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "AI moderation engine is not available");
        }
        return result;
    }

    private PostStatus parseDecision(String rawDecision) {
        if (rawDecision == null || rawDecision.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Decision is required");
        }

        String normalized = rawDecision.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "APPROVE", "PUBLISHED" -> PostStatus.PUBLISHED;
            case "REMOVE", "REMOVED" -> PostStatus.REMOVED;
            case "FLAG", "FLAGGED", "REVIEW" -> PostStatus.FLAGGED;
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Decision must be APPROVE, REMOVE, or REVIEW");
        };
    }

    private ModerationQueueItem toQueueItem(Post post) {
        Optional<ModerationLog> latest = logs.findTopByPostOrderByCreatedAtDesc(post);
        return new ModerationQueueItem(
                post.getId(),
                post.getAuthor() == null ? "Unknown" : post.getAuthor().getFullName(),
                post.getContent(),
                post.getStatus(),
                latest.map(log -> log.getAiScore() == null ? 0.0 : log.getAiScore().doubleValue()).orElse(0.0),
                latest.map(ModerationLog::getFlaggedReason).orElse("Awaiting moderation"),
                post.getCreatedAt(),
                latest.map(ModerationLog::getHighlightSpans).orElse(null),
                post.getAuthor() == null ? 0 : (post.getAuthor().getViolationCount() == null ? 0 : post.getAuthor().getViolationCount()),
                post.getAuthor() == null ? null : post.getAuthor().getSuspendedUntil()
        );
    }
}
