package com.solsur.dto;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SaleResponseDTO {
    private Long id, productId;
    private LocalDate date;
    private String client, clientCuit, productName, paymentMethod, invoiceStatus, invoiceNumber, notes;
    private Integer quantity;
    private BigDecimal unitPrice, totalAmount;
    private LocalDateTime createdAt;
}
