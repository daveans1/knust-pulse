package edu.knust.backend.repository;

import edu.knust.backend.entity.CommentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
    long countByCommentId(Long commentId);
    boolean existsByCommentIdAndUserId(Long commentId, Long userId);
    Optional<CommentLike> findByCommentIdAndUserId(Long commentId, Long userId);
    @Query("SELECT COUNT(l) FROM CommentLike l WHERE l.comment.post.author.id = :authorId")
    long countCommentLikesReceivedByAuthorId(Long authorId);
}
