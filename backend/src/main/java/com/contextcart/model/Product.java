package com.contextcart.model;

public class Product {
    private String id;
    private String name;
    private String category;
    private double price;
    private String image;
    private String description;
    private double intentScore;

    public Product(String id, String name, String category, double price, String image, String description) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.image = image;
        this.description = description;
        this.intentScore = 0.0;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public double getPrice() { return price; }
    public String getImage() { return image; }
    public String getDescription() { return description; }
    public double getIntentScore() { return intentScore; }
    public void setIntentScore(double intentScore) { this.intentScore = intentScore; }
}
