package com.solsur.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name="sales")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Sale {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false) @NotNull private LocalDate date;

    @Column(nullable=false, length=150) @NotBlank private String client;
    @Column(name="client_cuit", length=20) private String clientCuit;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="product_id", nullable=false)
    @NotNull private Product product;

    @Column(name="product_name", nullable=false, length=150) private String productName;

    @Column(nullable=false) @Min(1) private Integer quantity;

    @Column(name="unit_price",   nullable=false, precision=12, scale=2) private BigDecimal unitPrice;
    @Column(name="total_amount", nullable=false, precision=12, scale=2) private BigDecimal totalAmount;

    @Column(name="payment_method", nullable=false, length=50) @NotBlank private String paymentMethod;

    @Column(name="invoice_status", nullable=false, length=30) @Builder.Default private String invoiceStatus = "Pendiente";
    @Column(name="invoice_number", length=30) private String invoiceNumber;

    @Column(columnDefinition="TEXT") private String notes;

    @Column(name="created_at", updatable=false) @Builder.Default private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist public void prePersist() {
        if (totalAmount == null && unitPrice != null && quantity != null)
            totalAmount = unitPrice.multiply(BigDecimal.valueOf(quantity));
        if (date == null) date = LocalDate.now();
    }
}
