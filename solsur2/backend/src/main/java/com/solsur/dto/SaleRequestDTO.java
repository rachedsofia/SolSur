package com.solsur.dto;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SaleRequestDTO {
    private LocalDate date;
    @NotBlank private String client;
    private String clientCuit;
    @NotNull private Long productId;
    @NotNull @Min(1) private Integer quantity;
    @NotBlank private String paymentMethod;
    private String invoiceStatus;
    private String notes;
}
