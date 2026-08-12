package edu.knust.backend.entity;

import edu.knust.backend.model.PostStatus;
import edu.knust.backend.model.PostType;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id")
    private Community community;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "post_type", length = 50)
    private PostType postType = PostType.TEXT;

    @Column(name = "media_url")
    private String mediaUrl;

    @Column(name = "media_type")
    private String mediaType;

    @Column(name = "view_count")
    private Long viewCount = 0L;

    @Column(name = "repost_count")
    private Long repostCount = 0L;

    @Column(name = "share_count")
    private Long shareCount = 0L;

    @Column(name = "is_anonymous")
    private Boolean isAnonymous = false;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private PostStatus status = PostStatus.PENDING;

    private Integer upvotes = 0;
    private Integer downvotes = 0;
    private Integer views = 0;
    private Integer reposts = 0;
    private Integer shares = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }
    public Community getCommunity() { return community; }
    public void setCommunity(Community community) { this.community = community; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public PostType getPostType() { return postType; }
    public void setPostType(PostType postType) { this.postType = postType; }
    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    public String getMediaType() { return mediaType; }
    public void setMediaType(String mediaType) { this.mediaType = mediaType; }
    public Long getViewCount() { return viewCount; }
    public void setViewCount(Long viewCount) { this.viewCount = viewCount; }
    public Long getRepostCount() { return repostCount; }
    public void setRepostCount(Long repostCount) { this.repostCount = repostCount; }
    public Long getShareCount() { return shareCount; }
    public void setShareCount(Long shareCount) { this.shareCount = shareCount; }
    public Boolean getIsAnonymous() { return isAnonymous; }
    public void setIsAnonymous(Boolean isAnonymous) { this.isAnonymous = isAnonymous; }
    public PostStatus getStatus() { return status; }
    public void setStatus(PostStatus status) { this.status = status; }
    public Integer getUpvotes() { return upvotes; }
    public void setUpvotes(Integer upvotes) { this.upvotes = upvotes; }
    public Integer getDownvotes() { return downvotes; }
    public void setDownvotes(Integer downvotes) { this.downvotes = downvotes; }
    public Integer getViews() { return views; }
    public void setViews(Integer views) { this.views = views; }
    public Integer getReposts() { return reposts; }
    public void setReposts(Integer reposts) { this.reposts = reposts; }
    public Integer getShares() { return shares; }
    public void setShares(Integer shares) { this.shares = shares; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
