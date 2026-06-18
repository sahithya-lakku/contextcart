package com.contextcart.service;

import com.contextcart.model.BehaviorEvent;
import com.contextcart.model.Product;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class IntentScoringService {

    // sessionId -> (category -> score)
    private final Map<String, Map<String, Double>> sessionScores = new ConcurrentHashMap<>();

    // sessionId -> (category -> raw signals)
    private final Map<String, Map<String, Map<String, Double>>> sessionSignals = new ConcurrentHashMap<>();

    private final List<Product> catalog = buildCatalog();

    public void processEvent(BehaviorEvent event) {
        String session = event.getSessionId();
        String category = event.getCategory();

        sessionScores.computeIfAbsent(session, k -> new ConcurrentHashMap<>());
        sessionSignals.computeIfAbsent(session, k -> new ConcurrentHashMap<>());

        Map<String, Double> signals = sessionSignals.get(session)
                .computeIfAbsent(category, k -> new ConcurrentHashMap<>());

        // Accumulate signals
        signals.merge("hoverTime", event.getHoverTime(), Double::sum);
        signals.merge("scrollDepth", event.getScrollDepth(), Math::max);
        signals.merge("revisits", (double) event.getRevisits(), Double::sum);
        signals.merge("clicks", (double) event.getClicks(), Double::sum);

        // Weighted intent score formula
        double hoverNorm = Math.min(signals.get("hoverTime") / 30.0, 1.0);   // normalize to 30s max
        double scrollNorm = signals.getOrDefault("scrollDepth", 0.0);
        double revisitNorm = Math.min(signals.getOrDefault("revisits", 0.0) / 5.0, 1.0);
        double clickNorm = Math.min(signals.getOrDefault("clicks", 0.0) / 3.0, 1.0);

        double score = (hoverNorm * 0.35) + (scrollNorm * 0.25) + (revisitNorm * 0.25) + (clickNorm * 0.15);
        score = Math.round(score * 1000.0) / 1000.0;

        sessionScores.get(session).put(category, score);
    }

    public List<Product> getRecommendations(String sessionId, int limit) {
        Map<String, Double> scores = sessionScores.getOrDefault(sessionId, new HashMap<>());

        if (scores.isEmpty()) {
            // Cold start — return top-rated items
            return catalog.stream().limit(limit).collect(Collectors.toList());
        }

        // Score every product by its category intent score
        List<Product> scored = catalog.stream().map(p -> {
            double intentScore = scores.getOrDefault(p.getCategory(), 0.0);
            p.setIntentScore(intentScore);
            return p;
        }).collect(Collectors.toList());

        // Sort by intent score descending
        scored.sort((a, b) -> Double.compare(b.getIntentScore(), a.getIntentScore()));

        return scored.stream().limit(limit).collect(Collectors.toList());
    }

    public Map<String, Double> getCategoryScores(String sessionId) {
        return sessionScores.getOrDefault(sessionId, new HashMap<>());
    }

    public Map<String, Map<String, Double>> getAllSessionScores() {
        Map<String, Map<String, Double>> result = new HashMap<>();
        for (Map.Entry<String, Map<String, Double>> entry : sessionScores.entrySet()) {
            result.put(entry.getKey(), entry.getValue());
        }
        return result;
    }

    private List<Product> buildCatalog() {
        return Arrays.asList(
            new Product("p1", "Sony WH-1000XM5 Headphones", "Electronics", 29999,
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
                "Industry-leading noise cancellation"),
            new Product("p2", "Samsung 65\" 4K QLED TV", "Electronics", 89999,
                "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=300",
                "Quantum HDR, 120Hz refresh"),
            new Product("p3", "Apple MacBook Air M2", "Electronics", 114999,
                "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300",
                "18-hour battery, 8-core GPU"),
            new Product("p4", "Nike Air Max 270", "Fashion", 12995,
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300",
                "Max Air cushioning, streetwear icon"),
            new Product("p5", "Levi's 511 Slim Jeans", "Fashion", 3999,
                "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300",
                "Classic slim fit, premium denim"),
            new Product("p6", "Zara Oversized Blazer", "Fashion", 5990,
                "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300",
                "Relaxed fit, versatile styling"),
            new Product("p7", "Instant Pot Duo 7-in-1", "Home & Kitchen", 8999,
                "https://images.unsplash.com/photo-1585515320310-259814833e62?w=300",
                "Pressure cooker, slow cooker & more"),
            new Product("p8", "Dyson V15 Vacuum", "Home & Kitchen", 52900,
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300",
                "Laser dust detection, 60-min runtime"),
            new Product("p9", "IKEA KALLAX Shelf Unit", "Home & Kitchen", 7999,
                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300",
                "Versatile storage & display"),
            new Product("p10", "The Alchemist - Paulo Coelho", "Books", 299,
                "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300",
                "25M+ copies sold worldwide"),
            new Product("p11", "Atomic Habits - James Clear", "Books", 499,
                "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=300",
                "Tiny changes, remarkable results"),
            new Product("p12", "Creatine Monohydrate 500g", "Sports & Fitness", 1299,
                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300",
                "Micronized, unflavored, lab-tested"),
            new Product("p13", "Yoga Mat Premium 6mm", "Sports & Fitness", 1999,
                "https://images.unsplash.com/photo-1601925228925-39a1b5a6e0fd?w=300",
                "Non-slip, eco-friendly TPE"),
            new Product("p14", "JBL Flip 6 Bluetooth Speaker", "Electronics", 9999,
                "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300",
                "IP67 waterproof, 12hr battery"),
            new Product("p15", "Scented Candle Gift Set", "Home & Kitchen", 1499,
                "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300",
                "Soy wax, 6 relaxing fragrances")
        );
    }
}
