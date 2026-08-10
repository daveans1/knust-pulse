package edu.knust.backend.controller;

import edu.knust.backend.dto.*;
import edu.knust.backend.entity.DirectMessage;
import edu.knust.backend.entity.User;
import edu.knust.backend.repository.DirectMessageRepository;
import edu.knust.backend.repository.UserRepository;
import edu.knust.backend.service.ModerationClient;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    private final DirectMessageRepository messages; 
    private final UserRepository users;
    private final ModerationClient moderationClient;
    private final edu.knust.backend.repository.ModerationLogRepository logs;

    public MessageController(DirectMessageRepository messages, UserRepository users, ModerationClient moderationClient, edu.knust.backend.repository.ModerationLogRepository logs) { 
        this.messages = messages; 
        this.users = users; 
        this.moderationClient = moderationClient;
        this.logs = logs;
    }

    @GetMapping("/conversations")
    public List<ConversationResponse> conversations(@AuthenticationPrincipal User current) {
        Map<Long, List<DirectMessage>> grouped = new LinkedHashMap<>();
        for (DirectMessage message : messages.findAllForUser(current.getId())) { Long otherId = message.getSender().getId().equals(current.getId()) ? message.getRecipient().getId() : message.getSender().getId(); grouped.computeIfAbsent(otherId, ignored -> new ArrayList<>()).add(message); }
        return grouped.values().stream().map(thread -> { DirectMessage latest = thread.get(thread.size() - 1); User participant = latest.getSender().getId().equals(current.getId()) ? latest.getRecipient() : latest.getSender(); long unread = thread.stream().filter(item -> item.getRecipient().getId().equals(current.getId()) && !Boolean.TRUE.equals(item.getRead())).count(); return new ConversationResponse(ApiMapper.user(participant), latest.getContent(), latest.getCreatedAt(), unread); }).sorted(Comparator.comparing((ConversationResponse response) -> response.lastMessageAt(), Comparator.nullsLast(Comparator.naturalOrder())).reversed()).toList();
    }

    @GetMapping("/with/{userId}")
    @Transactional
    public List<MessageResponse> conversation(@PathVariable Long userId, @AuthenticationPrincipal User current) {
        List<DirectMessage> thread = messages.findConversation(current.getId(), userId);
        thread.stream().filter(message -> message.getRecipient().getId().equals(current.getId()) && !Boolean.TRUE.equals(message.getRead())).forEach(message -> message.setRead(true));
        return thread.stream().map(ApiMapper::message).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse send(@RequestBody SendMessageRequest request, @AuthenticationPrincipal User sender) {
        if (sender.getSuspendedUntil() != null && sender.getSuspendedUntil().isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your account is currently suspended from sending messages due to community guideline violations.");
        }
        Long recipientId = request.recipientId();
        if (recipientId == null || recipientId.equals(sender.getId())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose another recipient");
        if (request.content() == null || request.content().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A message needs text");
        User recipient = users.findById(recipientId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipient not found"));
        
        String cleanContent = request.content().trim();
        
        // ML Engine DM Interceptor
        int currentViolations = sender.getViolationCount() != null ? sender.getViolationCount() : 0;
        ModerationEngineResponse aiResponse = moderationClient.moderateText(cleanContent, sender.getId(), currentViolations, true);
        
        edu.knust.backend.entity.ModerationLog log = new edu.knust.backend.entity.ModerationLog();
        log.setItemType("MESSAGE");
        if (aiResponse != null) {
            log.setAiScore(java.math.BigDecimal.valueOf(aiResponse.overall_risk_score() != null ? aiResponse.overall_risk_score() : 0.0));
            log.setFlaggedReason(aiResponse.triggered_categories() != null && !aiResponse.triggered_categories().isEmpty() ? String.join(", ", aiResponse.triggered_categories()) : null);
        } else {
            log.setAiScore(java.math.BigDecimal.ZERO);
        }
        log.setFinalDecision(edu.knust.backend.model.PostStatus.PUBLISHED);
        log.setCreatedAt(LocalDateTime.now());
        logs.save(log);

        if (aiResponse != null) {
            String action = aiResponse.action();
            boolean userPenalized = false;
            
            if ("urgent_escalate".equals(action)) {
                sender.setViolationCount(currentViolations + 2);
                userPenalized = true;
                log.setFinalDecision(edu.knust.backend.model.PostStatus.REMOVED);
            } else if ("remove_review".equals(action)) {
                sender.setViolationCount(currentViolations + 1);
                userPenalized = true;
                log.setFinalDecision(edu.knust.backend.model.PostStatus.FLAGGED);
            }
            logs.save(log);

            if (sender.getRole() == edu.knust.backend.model.UserRole.ADMIN_STAFF || sender.getRole() == edu.knust.backend.model.UserRole.PROJECT_STAFF) {
                userPenalized = false;
                sender.setViolationCount(currentViolations);
            }
            
            if (userPenalized) {
                if (sender.getViolationCount() >= 3) {
                    sender.setSuspendedUntil(LocalDateTime.now().plusDays(2));
                    sender.setViolationCount(0); // Reset for next time
                }
                users.save(sender);
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Message blocked by moderation. You have been penalized for violating community guidelines.");
            }
        }

        DirectMessage message = new DirectMessage(); message.setSender(sender); message.setRecipient(recipient); message.setContent(cleanContent); message.setMediaUrl(request.mediaUrl() == null || request.mediaUrl().isBlank() ? null : request.mediaUrl().trim()); message.setCreatedAt(LocalDateTime.now()); message.setRead(false);
        return ApiMapper.message(messages.save(message));
    }

    @DeleteMapping("/{messageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void deleteMessage(@PathVariable Long messageId, @AuthenticationPrincipal User user) {
        DirectMessage msg = messages.findById(messageId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found"));
        if (!msg.getSender().getId().equals(user.getId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own messages");
        messages.delete(msg);
    }
}
