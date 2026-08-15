package edu.knust.backend.repository;

import edu.knust.backend.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    long countByPostId(Long postId);
    boolean existsByPostIdAndUserId(Long postId, Long userId);
    Optional<PostLike> findByPostIdAndUserId(Long postId, Long userId);
    @Query("SELECT COUNT(l) FROM PostLike l WHERE l.post.author.id = :authorId")
    long countLikesReceivedByAuthorId(Long authorId);

    @Modifying
    @Query("DELETE FROM PostLike pl WHERE pl.post.id = :postId")
    void deleteByPostId(Long postId);
}
