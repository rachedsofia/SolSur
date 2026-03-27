package com.solsur.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name="invoices")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Invoice {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(name="invoice_type", nullable=false, length=30) private String invoiceType;
    @Column(name="punto_venta", length=10) private String puntoVenta;
    @Column(name="numero", length=20)      private String numero;
    @Column(name="razon_social", length=200) private String razonSocial;
    @Column(length=30)   private String cuit;
    @Column(length=300)  private String domicilio;
    @Column(name="condicion_iva", length=60) private String condicionIva;
    @Column(name="concepto", length=200) private String concepto;

    @Column(name="monto_neto",  precision=12, scale=2) private BigDecimal montoNeto;
    @Column(name="alicuota_iva",precision=5,  scale=2) private BigDecimal alicuotaIva;
    @Column(name="monto_iva",   precision=12, scale=2) private BigDecimal montoIva;
    @Column(name="total",       precision=12, scale=2) private BigDecimal total;

    @Column(name="fecha_vencimiento") private LocalDate fechaVencimiento;
    @Column(name="fecha_emision")     @Builder.Default private LocalDate fechaEmision = LocalDate.now();

    @Column(length=30) @Builder.Default private String status = "Borrador";
    @Column(columnDefinition="TEXT") private String observaciones;

    // ─── Campos AFIP ─────────────────────────────────────────────────────────
    @Column(name="cae", length=20)           private String cae;
    @Column(name="cae_vencimiento")          private LocalDate caeVencimiento;
    @Column(name="afip_nro_comprobante")     private Long afipNroComprobante;
    @Column(name="afip_resultado", length=5) private String afipResultado;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="sale_id") private Sale sale;

    @Column(name="created_at", updatable=false) @Builder.Default private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist public void prePersist() {
        if (montoNeto != null && alicuotaIva != null) {
            montoIva = montoNeto.multiply(alicuotaIva).divide(BigDecimal.valueOf(100));
            total    = montoNeto.add(montoIva);
        }
    }
}
