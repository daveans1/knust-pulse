package edu.knust.backend.repository;

import edu.knust.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    long countByPostId(Long postId);
    @Query("SELECT c FROM Comment c JOIN FETCH c.author WHERE c.post.id = :postId ORDER BY c.createdAt ASC")
    List<Comment> findByPostIdWithAuthor(Long postId);

    @Modifying
    @Query("DELETE FROM Comment c WHERE c.post.id = :postId")
    void deleteByPostId(Long postId);
}
