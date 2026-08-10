package edu.knust.backend.repository;

import edu.knust.backend.entity.DirectMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface DirectMessageRepository extends JpaRepository<DirectMessage, Long> {
    @Query("SELECT m FROM DirectMessage m JOIN FETCH m.sender JOIN FETCH m.recipient WHERE m.sender.id = :userId OR m.recipient.id = :userId ORDER BY m.createdAt ASC")
    List<DirectMessage> findAllForUser(Long userId);
    @Query("SELECT m FROM DirectMessage m JOIN FETCH m.sender JOIN FETCH m.recipient WHERE (m.sender.id = :firstId AND m.recipient.id = :secondId) OR (m.sender.id = :secondId AND m.recipient.id = :firstId) ORDER BY m.createdAt ASC")
    List<DirectMessage> findConversation(Long firstId, Long secondId);
}
