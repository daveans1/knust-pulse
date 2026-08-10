package edu.knust.backend.repository;

import edu.knust.backend.entity.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    Optional<Friendship> findByRequesterIdAndAddresseeId(Long requesterId, Long addresseeId);
    @Query("SELECT f FROM Friendship f JOIN FETCH f.requester JOIN FETCH f.addressee WHERE f.requester.id = :userId OR f.addressee.id = :userId")
    List<Friendship> findAllForUser(Long userId);
}
