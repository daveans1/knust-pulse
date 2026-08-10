package edu.knust.backend.repository;

import edu.knust.backend.entity.Post;
import edu.knust.backend.model.PostStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByStatus(PostStatus status);

    long countByStatus(PostStatus status);

    @Query("SELECT p FROM Post p JOIN FETCH p.author LEFT JOIN FETCH p.community WHERE p.status = :status ORDER BY p.createdAt DESC")
    List<Post> findByStatusWithAuthor(PostStatus status, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT p FROM Post p JOIN FETCH p.author LEFT JOIN FETCH p.community WHERE p.status = :status ORDER BY (p.views + p.reposts + p.shares) DESC")
    List<Post> findTrendingWithAuthor(PostStatus status, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT p FROM Post p JOIN FETCH p.author LEFT JOIN FETCH p.community WHERE p.status IN :statuses ORDER BY p.createdAt DESC")
    List<Post> findByStatusesWithAuthor(List<PostStatus> statuses);

    long countByAuthorIdAndStatus(Long authorId, PostStatus status);

    @Query("SELECT p FROM Post p JOIN FETCH p.author LEFT JOIN FETCH p.community WHERE p.author.id = :authorId AND p.status = :status ORDER BY p.createdAt DESC")
    List<Post> findByAuthorIdAndStatusWithAuthor(Long authorId, PostStatus status);

    @Query("SELECT p FROM Post p JOIN FETCH p.author LEFT JOIN FETCH p.community WHERE p.community.id = :communityId AND p.status = :status ORDER BY p.createdAt DESC")
    List<Post> findByCommunityIdAndStatusWithAuthor(Long communityId, PostStatus status);
}
