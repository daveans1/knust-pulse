package edu.knust.backend.controller;

import edu.knust.backend.dto.*;
import edu.knust.backend.entity.*;
import edu.knust.backend.model.PostStatus;
import edu.knust.backend.model.PostType;
import edu.knust.backend.model.ReportStatus;
import edu.knust.backend.repository.*;
import edu.knust.backend.service.ModerationClient;
import edu.knust.backend.service.NotificationService;
import jakarta.transaction.Transactional;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostRepository posts;
    private final CommunityRepository communities;
    private final CommentRepository comments;
    private final PostLikeRepository likes;
    private final ReportRepository reports;
    private final ModerationLogRepository logs;
    private final CommentLikeRepository commentLikes;
    private final ModerationClient moderationClient;
    private final UserRepository users;
    private final NotificationService notificationService;

    public PostController(PostRepository posts, CommunityRepository communities, CommentRepository comments, PostLikeRepository likes, CommentLikeRepository commentLikes, ReportRepository reports, ModerationLogRepository logs, ModerationClient moderationClient, UserRepository users, NotificationService notificationService) {
        this.posts = posts;
        this.communities = communities;
        this.comments = comments;
        this.likes = likes;
        this.commentLikes = commentLikes;
        this.reports = reports;
        this.logs = logs;
        this.moderationClient = moderationClient;
        this.users = users;
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<FeedPostResponse> feed(@RequestParam(defaultValue = "foryou") String filter, @AuthenticationPrincipal User viewer) { 
        if ("trending".equalsIgnoreCase(filter)) {
            return posts.findTrendingWithAuthor(PostStatus.PUBLISHED, org.springframework.data.domain.PageRequest.of(0, 40)).stream().map(post -> feedPost(post, viewer)).toList();
        }
        return posts.findByStatusWithAuthor(PostStatus.PUBLISHED, org.springframework.data.domain.PageRequest.of(0, 30)).stream().map(post -> feedPost(post, viewer)).toList(); 
    }

    @GetMapping("/{postId}")
    public FeedPostResponse get(@PathVariable @NonNull Long postId, @AuthenticationPrincipal User viewer) { return feedPost(findPost(postId), viewer); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FeedPostResponse create(@RequestBody CreatePostRequest request, @AuthenticationPrincipal User author) {
        if (author.getSuspendedUntil() != null && author.getSuspendedUntil().isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your account is currently suspended from posting due to community guideline violations.");
        }
        if (request.content() == null || request.content().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A post needs text");
        Post post = new Post(); post.setAuthor(author); post.setContent(request.content().trim()); post.setMediaUrl(blankToNull(request.mediaUrl())); post.setCreatedAt(LocalDateTime.now()); post.setUpvotes(0); post.setDownvotes(0); post.setViewCount(0L); post.setRepostCount(0L); post.setShareCount(0L);
        post.setPostType(parseType(request.postType(), post.getMediaUrl()));
        Long communityId = request.communityId();
        Community community = null;
        if (communityId != null) {
            community = communities.findById(communityId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));
        } else if (author.getCollege() != null) {
            community = communities.findFirstByCollege(author.getCollege()).orElse(null);
        }
        post.setCommunity(community);

        // ML Engine Interceptor
        int currentViolations = author.getViolationCount() != null ? author.getViolationCount() : 0;
        ModerationEngineResponse aiResponse = moderationClient.moderateText(post.getContent(), author.getId(), currentViolations, false);
        if (aiResponse != null) {
            boolean isRemoveAction = isRemove(aiResponse);
            boolean isReviewAction = isReview(aiResponse);
            boolean userPenalized = false;

            if (isRemoveAction) {
                post.setStatus(PostStatus.REMOVED);
                author.setViolationCount(currentViolations + 2);
                userPenalized = true;
                
                // Notify admins in real-time
                notificationService.notifyAdmins("urgent_alert", Map.of(
                    "author", author.getFullName(),
                    "content", post.getContent(),
                    "reason", aiResponse.triggered_categories() != null && !aiResponse.triggered_categories().isEmpty() ? aiResponse.triggered_categories().get(0) : "Severe violation"
                ));
            } else if (isReviewAction) {
                post.setStatus(PostStatus.FLAGGED);
                author.setViolationCount(currentViolations + 1);
                userPenalized = true;
            } else {
                post.setStatus(PostStatus.PUBLISHED);
            }

            if (author.getRole() == edu.knust.backend.model.UserRole.ADMIN_STAFF || author.getRole() == edu.knust.backend.model.UserRole.PROJECT_STAFF) {
                userPenalized = false;
                author.setViolationCount(currentViolations); // Revert strike addition
            }

            if (userPenalized) {
                if (author.getViolationCount() >= 3) {
                    author.setSuspendedUntil(LocalDateTime.now().plusDays(7));
                    author.setViolationCount(0); // Reset for next time they come back
                }
                users.save(author);
            }
        } else {
            post.setStatus(PostStatus.PUBLISHED);
        }

        Post saved = posts.save(post);

        ModerationLog log = new ModerationLog();
        log.setItemType("POST");
        log.setPost(saved);
        if (aiResponse != null) {
            log.setAiScore(BigDecimal.valueOf(aiResponse.overall_risk_score() != null ? aiResponse.overall_risk_score() : 0.0));
            if (post.getStatus() == PostStatus.FLAGGED || post.getStatus() == PostStatus.REMOVED) {
                log.setFlaggedReason(aiResponse.priority_tier() + " \u00B7 ML Action: " + aiResponse.action());
            }
            if (aiResponse.highlight_spans() != null) {
                log.setHighlightSpans(aiResponse.highlight_spans().toString());
            }
        } else {
            log.setAiScore(BigDecimal.ZERO);
        }
        log.setFinalDecision(post.getStatus());
        log.setCreatedAt(LocalDateTime.now());
        logs.save(log);

        return feedPost(saved, author);
    }

    @PostMapping("/{postId}/likes")
    @Transactional
    public FeedPostResponse toggleLike(@PathVariable @NonNull Long postId, @AuthenticationPrincipal User user) {
        Post post = findPost(postId);
        likes.findByPostIdAndUserId(postId, user.getId()).ifPresentOrElse(likes::delete, () -> { PostLike like = new PostLike(); like.setPost(post); like.setUser(user); like.setCreatedAt(LocalDateTime.now()); likes.save(like); });
        return feedPost(post, user);
    }

    @PostMapping("/{postId}/view")
    @Transactional
    public FeedPostResponse view(@PathVariable @NonNull Long postId, @AuthenticationPrincipal User user) {
        Post post = findPost(postId);
        post.setViewCount((post.getViewCount() == null ? 0L : post.getViewCount()) + 1L);
        return feedPost(posts.save(post), user);
    }

    @PostMapping("/{postId}/repost")
    @Transactional
    public FeedPostResponse repost(@PathVariable @NonNull Long postId, @AuthenticationPrincipal User user) {
        Post post = findPost(postId);
        post.setRepostCount((post.getRepostCount() == null ? 0L : post.getRepostCount()) + 1L);
        return feedPost(posts.save(post), user);
    }

    @PostMapping("/{postId}/share")
    @Transactional
    public FeedPostResponse share(@PathVariable @NonNull Long postId, @AuthenticationPrincipal User user) {
        Post post = findPost(postId);
        post.setShareCount((post.getShareCount() == null ? 0L : post.getShareCount()) + 1L);
        return feedPost(posts.save(post), user);
    }

    @PostMapping("/{postId}/report")
    @Transactional
    public void reportPost(@PathVariable @NonNull Long postId, @RequestBody(required = false) ReportRequest request, @AuthenticationPrincipal User reporter) {
        Post post = findPost(postId);
        String reason = (request != null && request.reason() != null && !request.reason().isBlank()) 
            ? request.reason().trim() 
            : "User report: inappropriate content";

        Report report = new Report();
        report.setPost(post);
        report.setReportedBy(reporter);
        report.setReason(reason);
        report.setStatus(ReportStatus.OPEN);
        report.setCreatedAt(LocalDateTime.now());
        reports.save(report);

        // Flag the post so it moves to Moderation Queue for Admin review
        post.setStatus(PostStatus.FLAGGED);
        posts.save(post);

        // Create Moderation Log record so Moderation Queue displays the reason
        ModerationLog log = new ModerationLog();
        log.setPost(post);
        log.setAiScore(new BigDecimal("78.0")); // Priority 2 High Risk
        log.setFlaggedReason("User Report: " + reason);
        log.setCreatedAt(LocalDateTime.now());
        logs.save(log);
    }

    @GetMapping("/{postId}/comments")
    public List<CommentResponse> comments(@PathVariable @NonNull Long postId) { findPost(postId); return comments.findByPostIdWithAuthor(postId).stream().map(ApiMapper::comment).toList(); }

    @PostMapping("/{postId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse comment(@PathVariable @NonNull Long postId, @RequestBody CreateCommentRequest request, @AuthenticationPrincipal User author) {
        if (author.getSuspendedUntil() != null && author.getSuspendedUntil().isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your account is currently suspended from commenting due to community guideline violations.");
        }
        if (request.content() == null || request.content().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A reply needs text");
        
        String text = request.content().trim();
        
        // ML Engine Interceptor
        int currentViolations = author.getViolationCount() != null ? author.getViolationCount() : 0;
        edu.knust.backend.dto.ModerationEngineResponse aiResponse = moderationClient.moderateText(text, author.getId(), currentViolations, false);
        
        edu.knust.backend.entity.ModerationLog log = new edu.knust.backend.entity.ModerationLog();
        log.setItemType("COMMENT");
        if (aiResponse != null) {
            log.setAiScore(java.math.BigDecimal.valueOf(aiResponse.overall_risk_score()));
            log.setFlaggedReason(aiResponse.triggered_categories() != null && !aiResponse.triggered_categories().isEmpty() ? String.join(", ", aiResponse.triggered_categories()) : null);
        } else {
            log.setAiScore(java.math.BigDecimal.ZERO);
        }
        log.setFinalDecision(edu.knust.backend.model.PostStatus.PUBLISHED);
        log.setCreatedAt(LocalDateTime.now());
        logs.save(log);

        if (aiResponse != null) {
            boolean isRemoveAction = isRemove(aiResponse);
            boolean isReviewAction = isReview(aiResponse);
            boolean userPenalized = false;

            if (isRemoveAction) {
                author.setViolationCount(currentViolations + 2);
                userPenalized = true;
                log.setFinalDecision(edu.knust.backend.model.PostStatus.REMOVED);
            } else if (isReviewAction) {
                author.setViolationCount(currentViolations + 1);
                userPenalized = true;
                log.setFinalDecision(edu.knust.backend.model.PostStatus.FLAGGED);
            }
            logs.save(log);

            if (author.getRole() == edu.knust.backend.model.UserRole.ADMIN_STAFF || author.getRole() == edu.knust.backend.model.UserRole.PROJECT_STAFF) {
                userPenalized = false;
                author.setViolationCount(currentViolations);
            }

            if (userPenalized) {
                if (author.getViolationCount() >= 3) {
                    author.setSuspendedUntil(LocalDateTime.now().plusDays(2));
                    author.setViolationCount(0); // Reset after suspension
                }
                users.save(author);
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Message blocked by moderation: " + (aiResponse.triggered_categories() != null && !aiResponse.triggered_categories().isEmpty() ? aiResponse.triggered_categories().get(0) : "Violates community guidelines"));
            }
        }

        Comment comment = new Comment(); 
        comment.setPost(findPost(postId)); 
        comment.setAuthor(author); 
        comment.setContent(text); 
        comment.setCreatedAt(LocalDateTime.now()); 
        comment.setLikeCount(0L);
        return ApiMapper.comment(comments.save(comment));
    }

    @DeleteMapping("/{postId}")
    @Transactional
    public void deletePost(@PathVariable @NonNull Long postId, @AuthenticationPrincipal User viewer) {
        Post post = findPost(postId);
        if (!post.getAuthor().getId().equals(viewer.getId()) && !viewer.getRole().name().contains("STAFF")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the author or a staff member can delete this post");
        }
        commentLikes.deleteByPostId(postId);
        comments.deleteByPostId(postId);
        likes.deleteByPostId(postId);
        reports.deleteByPostId(postId);
        logs.deleteByPostId(postId);
        posts.delete(post);
    }

    @DeleteMapping("/{postId}/comments/{commentId}")
    @Transactional
    public void deleteComment(@PathVariable @NonNull Long postId, @PathVariable @NonNull Long commentId, @AuthenticationPrincipal User viewer) {
        Comment comment = comments.findById(commentId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
        if (!comment.getPost().getId().equals(postId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment does not belong to this post");
        }
        if (!comment.getAuthor().getId().equals(viewer.getId()) && !viewer.getRole().name().contains("STAFF")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the author or a staff member can delete this comment");
        }
        commentLikes.deleteByCommentId(commentId);
        comments.delete(comment);
    }

    @PostMapping("/{postId}/comments/{commentId}/likes")
    @Transactional
    public CommentResponse toggleCommentLike(@PathVariable @NonNull Long postId, @PathVariable @NonNull Long commentId, @AuthenticationPrincipal User user) {
        Comment comment = comments.findById(commentId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
        if (!comment.getPost().getId().equals(postId)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment does not belong to this post");
        return ApiMapper.comment(comments.save(comment));
    }

    private boolean isRemove(ModerationEngineResponse ai) {
        if (ai == null) return false;
        String a = ai.action();
        String t = ai.priority_tier();
        String s = ai.post_status();
        return "REMOVE".equalsIgnoreCase(a) || "urgent_escalate".equalsIgnoreCase(a)
                || "REMOVED".equalsIgnoreCase(s) || "1".equals(t);
    }

    private boolean isReview(ModerationEngineResponse ai) {
        if (ai == null) return false;
        String a = ai.action();
        String t = ai.priority_tier();
        String s = ai.post_status();
        return "REVIEW".equalsIgnoreCase(a) || "remove_review".equalsIgnoreCase(a)
                || "hide_review".equalsIgnoreCase(a) || "FLAGGED".equalsIgnoreCase(s)
                || "2".equals(t) || "3".equals(t);
    }

    private Post findPost(@NonNull Long id) { return posts.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found")); }
    private FeedPostResponse feedPost(Post post, User viewer) { return new FeedPostResponse(post.getId(), ApiMapper.user(post.getAuthor()), post.getCommunity() == null ? "KNUST Pulse" : post.getCommunity().getName(), post.getContent(), post.getPostType(), post.getMediaUrl(), post.getStatus(), post.getCreatedAt(), likes.countByPostId(post.getId()), comments.countByPostId(post.getId()), post.getViewCount() == null ? 0L : post.getViewCount(), post.getRepostCount() == null ? 0L : post.getRepostCount(), post.getShareCount() == null ? 0L : post.getShareCount(), viewer != null && likes.existsByPostIdAndUserId(post.getId(), viewer.getId())); }
    private PostType parseType(String source, String mediaUrl) { try { return source == null || source.isBlank() ? mediaUrl == null ? PostType.TEXT : PostType.IMAGE : PostType.valueOf(source.toUpperCase()); } catch (IllegalArgumentException exception) { return PostType.TEXT; } }
    private String blankToNull(String source) { return source == null || source.isBlank() ? null : source.trim(); }
}
