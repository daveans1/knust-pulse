package edu.knust.backend.service;

import edu.knust.backend.dto.ModerationEngineResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
public class ModerationClient {

    private static final Logger log = LoggerFactory.getLogger(ModerationClient.class);
    private final RestTemplate restTemplate;
    private final String engineUrl;

    public ModerationClient(@Value("${moderation.service.url:http://localhost:8001}") String engineUrl, RestTemplateBuilder builder) {
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(20))
                .build();
        String url = (engineUrl == null || engineUrl.isBlank()) ? "http://localhost:8001" : engineUrl.trim();
        while (url.endsWith("/")) {
            url = url.substring(0, url.length() - 1);
        }
        this.engineUrl = url;
        log.info("Initialized ModerationClient with URL: {}", this.engineUrl);
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
            
            ModerationEngineResponse response = restTemplate.postForObject(engineUrl + "/moderate", request, ModerationEngineResponse.class);
            if (response != null) {
                log.info("Moderation response: risk={}, tier={}, action={}, status={}",
                        response.overall_risk_score(), response.priority_tier(), response.action(), response.post_status());
            }
            return response;
        } catch (Exception e) {
            log.warn("AI moderation service call failed ({}/moderate): {}", engineUrl, e.getMessage());
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

