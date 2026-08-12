package edu.knust.backend.entity;

import edu.knust.backend.model.PostStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "moderation_logs")
public class ModerationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id") // nullable = true for comments and DMs
    private Post post;

    @Column(name = "item_type")
    private String itemType; // e.g. "POST", "COMMENT", "MESSAGE"

    @Column(name = "ai_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal aiScore;

    @Column(name = "flagged_reason")
    private String flaggedReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "final_decision", columnDefinition = "post_status")
    private PostStatus finalDecision;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "highlight_spans", columnDefinition = "TEXT")
    private String highlightSpans;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public String getItemType() {
        return itemType;
    }

    public void setItemType(String itemType) {
        this.itemType = itemType;
    }

    public BigDecimal getAiScore() { return aiScore; }
    public void setAiScore(BigDecimal aiScore) { this.aiScore = aiScore; }
    public String getFlaggedReason() { return flaggedReason; }
    public void setFlaggedReason(String flaggedReason) { this.flaggedReason = flaggedReason; }
    public User getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; }
    public PostStatus getFinalDecision() { return finalDecision; }
    public void setFinalDecision(PostStatus finalDecision) { this.finalDecision = finalDecision; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getHighlightSpans() { return highlightSpans; }
    public void setHighlightSpans(String highlightSpans) { this.highlightSpans = highlightSpans; }
}
