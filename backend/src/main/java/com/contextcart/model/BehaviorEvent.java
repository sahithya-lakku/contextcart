package com.contextcart.model;

public class BehaviorEvent {
    private String sessionId;
    private String productId;
    private String category;
    private double hoverTime;    // seconds
    private double scrollDepth;  // 0.0 to 1.0
    private int revisits;
    private int clicks;

    public BehaviorEvent() {}

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public double getHoverTime() { return hoverTime; }
    public void setHoverTime(double hoverTime) { this.hoverTime = hoverTime; }

    public double getScrollDepth() { return scrollDepth; }
    public void setScrollDepth(double scrollDepth) { this.scrollDepth = scrollDepth; }

    public int getRevisits() { return revisits; }
    public void setRevisits(int revisits) { this.revisits = revisits; }

    public int getClicks() { return clicks; }
    public void setClicks(int clicks) { this.clicks = clicks; }
}
