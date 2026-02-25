package com.solsur.dto;
import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MonthlySaleDTO {
    private Integer month;
    private String monthName;
    private BigDecimal amount;
}
