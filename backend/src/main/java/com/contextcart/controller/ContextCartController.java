package com.contextcart.controller;

import com.contextcart.model.BehaviorEvent;
import com.contextcart.model.Product;
import com.contextcart.service.IntentScoringService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ContextCartController {

    @Autowired
    private IntentScoringService scoringService;

    // Receive behavior event from frontend
    @PostMapping("/event")
    public ResponseEntity<Map<String, Object>> trackEvent(@RequestBody BehaviorEvent event) {
        scoringService.processEvent(event);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("sessionId", event.getSessionId());
        return ResponseEntity.ok(response);
    }

    // Get personalized recommendations for a session
    @GetMapping("/recommendations/{sessionId}")
    public ResponseEntity<Map<String, Object>> getRecommendations(
            @PathVariable String sessionId,
            @RequestParam(defaultValue = "6") int limit) {

        List<Product> products = scoringService.getRecommendations(sessionId, limit);
        Map<String, Double> scores = scoringService.getCategoryScores(sessionId);

        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", sessionId);
        response.put("recommendations", products);
        response.put("categoryScores", scores);
        return ResponseEntity.ok(response);
    }

    // Dashboard — all active sessions and their scores
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Map<String, Double>> allScores = scoringService.getAllSessionScores();

        Map<String, Object> response = new HashMap<>();
        response.put("activeSessions", allScores.size());
        response.put("sessionScores", allScores);
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    // Health check
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> res = new HashMap<>();
        res.put("status", "running");
        res.put("service", "ContextCart API");
        return ResponseEntity.ok(res);
    }
}
