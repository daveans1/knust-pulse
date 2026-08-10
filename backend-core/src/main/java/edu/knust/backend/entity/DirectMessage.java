package edu.knust.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "direct_messages")
public class DirectMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "sender_id", nullable = false)
    private User sender;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    @Column(name = "media_url")
    private String mediaUrl;
    @Column(name = "is_read")
    private Boolean read = false;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    public Long getId() { return id; }
    public User getSender() { return sender; } public void setSender(User sender) { this.sender = sender; }
    public User getRecipient() { return recipient; } public void setRecipient(User recipient) { this.recipient = recipient; }
    public String getContent() { return content; } public void setContent(String content) { this.content = content; }
    public String getMediaUrl() { return mediaUrl; } public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    public Boolean getRead() { return read; } public void setRead(Boolean read) { this.read = read; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
