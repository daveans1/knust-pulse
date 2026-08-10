package edu.knust.backend.controller;

import edu.knust.backend.entity.User;
import edu.knust.backend.service.NotificationService;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/moderation")
public class AdminNotificationController {

    private final NotificationService notificationService;

    public AdminNotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@AuthenticationPrincipal User user) {
        if (user == null || (!user.getRole().name().equals("ADMIN_STAFF") && !user.getRole().name().equals("PROJECT_STAFF"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can subscribe to moderation alerts");
        }
        
        SseEmitter emitter = new SseEmitter(10 * 60 * 1000L); // 10 minutes timeout
        notificationService.addEmitter(emitter);
        
        try {
            emitter.send(SseEmitter.event().name("connected").data("Connected to Moderation Stream"));
        } catch (Exception e) {
            emitter.completeWithError(e);
        }
        
        return emitter;
    }
}
