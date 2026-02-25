package com.solsur.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name="products")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(unique=true, nullable=false, length=50)
    @NotBlank private String code;

    @Column(nullable=false, length=150)
    @NotBlank private String name;

    @Column(length=100) private String category;
    @Column(length=10)  private String size;
    @Column(length=60)  private String color;

    @Column(nullable=false) @Min(0) private Integer stock;

    @Column(name="cost_price", precision=12, scale=2) private BigDecimal costPrice;

    @Column(name="sale_price", nullable=false, precision=12, scale=2)
    @NotNull @DecimalMin("0.01") private BigDecimal salePrice;

    @Column(columnDefinition="TEXT") private String description;

    @Column(name="has_promotion", nullable=false) @Builder.Default private Boolean hasPromotion = false;
    @Column(name="promotion_type",  length=30)  private String promotionType;
    @Column(name="promotion_discount")           private Integer promotionDiscount;

    @Column(name="created_at", updatable=false) @Builder.Default private LocalDateTime createdAt = LocalDateTime.now();
    @Column(name="updated_at")                  @Builder.Default private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate public void preUpdate() { this.updatedAt = LocalDateTime.now(); }
}
