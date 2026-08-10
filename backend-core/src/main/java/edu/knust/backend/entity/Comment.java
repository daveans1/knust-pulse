package edu.knust.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class Comment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "post_id", nullable = false)
    private Post post;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "author_id", nullable = false)
    private User author;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    @Column(name = "is_verified_answer")
    private Boolean verifiedAnswer = false;
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "like_count")
    private Long likeCount = 0L;
    public Long getId() { return id; }
    public Post getPost() { return post; } public void setPost(Post post) { this.post = post; }
    public User getAuthor() { return author; } public void setAuthor(User author) { this.author = author; }
    public String getContent() { return content; } public void setContent(String content) { this.content = content; }
    public Boolean getVerifiedAnswer() { return verifiedAnswer; } public void setVerifiedAnswer(Boolean verifiedAnswer) { this.verifiedAnswer = verifiedAnswer; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Long getLikeCount() { return likeCount; } public void setLikeCount(Long likeCount) { this.likeCount = likeCount; }
}
