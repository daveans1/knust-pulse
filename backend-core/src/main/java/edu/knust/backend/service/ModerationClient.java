package edu.knust.backend.service;

import edu.knust.backend.dto.ModerationEngineResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class ModerationClient {

    private final RestTemplate restTemplate;
    private final String engineUrl;

    public ModerationClient(@Value("${moderation.service.url}") String engineUrl) {
        this.restTemplate = new RestTemplate();
        this.engineUrl = engineUrl;
    }

    public ModerationEngineResponse moderateText(String text, Long authorId, int userViolationCount, boolean isDm) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("text", text);
            body.put("author_id", authorId != null ? authorId.toString() : "anonymous");
            body.put("user_violation_count", userViolationCount);
            body.put("is_dm", isDm);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            
            return restTemplate.postForObject(engineUrl + "/moderate", request, ModerationEngineResponse.class);
        } catch (Exception e) {
            // Fallback if AI engine is down
            return null;
        }
    }

    public void sendFeedback(String text, String decision, String originalAction) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("text", text);
            body.put("decision", decision);
            if (originalAction != null) {
                body.put("original_action", originalAction);
            }

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            
            // Fire and forget - don't block on feedback
            new Thread(() -> {
                try {
                    restTemplate.postForObject(engineUrl + "/feedback", request, String.class);
                } catch (Exception ignored) {}
            }).start();
        } catch (Exception e) {
            // Ignore feedback errors
        }
    }
}
