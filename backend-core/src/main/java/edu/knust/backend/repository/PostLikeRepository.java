package edu.knust.backend.repository;

import edu.knust.backend.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    long countByPostId(Long postId);
    boolean existsByPostIdAndUserId(Long postId, Long userId);
    Optional<PostLike> findByPostIdAndUserId(Long postId, Long userId);
    @Query("SELECT COUNT(l) FROM PostLike l WHERE l.post.author.id = :authorId")
    long countLikesReceivedByAuthorId(Long authorId);
}
