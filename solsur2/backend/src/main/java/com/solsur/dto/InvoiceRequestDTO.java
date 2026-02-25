package com.solsur.dto;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InvoiceRequestDTO {
    @NotBlank private String invoiceType;
    private String puntoVenta, numero, razonSocial, cuit, domicilio, condicionIva, concepto, observaciones;
    @NotNull private BigDecimal montoNeto;
    @NotNull private BigDecimal alicuotaIva;
    private LocalDate fechaVencimiento;
    private Long saleId;
}
