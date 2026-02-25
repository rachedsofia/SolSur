package com.solsur.dto;
import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PaymentMethodStatsDTO {
    private String method;
    private Long count;
    private BigDecimal amount;
}
