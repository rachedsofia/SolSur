package com.solsur.dto;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InvoiceResponseDTO {
    private Long id;
    private String invoiceType, puntoVenta, numero, razonSocial, cuit, domicilio, condicionIva, concepto, status, observaciones;
    private BigDecimal montoNeto, alicuotaIva, montoIva, total;
    private LocalDate fechaVencimiento, fechaEmision;
    private LocalDateTime createdAt;
}
