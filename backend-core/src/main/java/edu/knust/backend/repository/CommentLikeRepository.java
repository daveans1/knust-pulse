package edu.knust.backend.repository;

import edu.knust.backend.entity.CommentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
    long countByCommentId(Long commentId);
    boolean existsByCommentIdAndUserId(Long commentId, Long userId);
    Optional<CommentLike> findByCommentIdAndUserId(Long commentId, Long userId);
    @Query("SELECT COUNT(l) FROM CommentLike l WHERE l.comment.post.author.id = :authorId")
    long countCommentLikesReceivedByAuthorId(Long authorId);

    @Modifying
    @Query("DELETE FROM CommentLike cl WHERE cl.comment.id = :commentId")
    void deleteByCommentId(Long commentId);

    @Modifying
    @Query("DELETE FROM CommentLike cl WHERE cl.comment.post.id = :postId")
    void deleteByPostId(Long postId);
}
