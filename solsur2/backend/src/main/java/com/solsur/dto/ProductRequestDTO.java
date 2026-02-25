package com.solsur.dto;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ProductRequestDTO {
    @NotBlank private String code;
    @NotBlank private String name;
    private String category;
    private String size;
    private String color;
    @NotNull @Min(0) private Integer stock;
    private BigDecimal costPrice;
    @NotNull @DecimalMin("0.01") private BigDecimal salePrice;
    private String description;
    private Boolean hasPromotion;
    private String promotionType;
    private Integer promotionDiscount;
}
