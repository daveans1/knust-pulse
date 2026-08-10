package edu.knust.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "followers")
public class Follow {

    @EmbeddedId
    private FollowId id = new FollowId();

    @ManyToOne
    @MapsId("followerId")
    @JoinColumn(name = "follower_id")
    private User follower;

    @ManyToOne
    @MapsId("followingId")
    @JoinColumn(name = "following_id")
    private User following;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public FollowId getId() { return id; }
    public void setId(FollowId id) { this.id = id; }
    public User getFollower() { return follower; }
    public void setFollower(User follower) { this.follower = follower; }
    public User getFollowing() { return following; }
    public void setFollowing(User following) { this.following = following; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
