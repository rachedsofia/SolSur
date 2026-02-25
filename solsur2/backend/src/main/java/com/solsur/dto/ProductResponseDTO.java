package com.solsur.dto;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ProductResponseDTO {
    private Long id;
    private String code, name, category, size, color, description, promotionType;
    private Integer stock, promotionDiscount;
    private BigDecimal costPrice, salePrice;
    private Boolean hasPromotion;
    private LocalDateTime createdAt, updatedAt;
}
