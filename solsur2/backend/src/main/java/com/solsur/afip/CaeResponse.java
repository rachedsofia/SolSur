package com.solsur.afip;

import lombok.Data;
import java.time.LocalDate;

/**
 * Resultado de autorizar una factura en AFIP.
 * El CAE es el Código de Autorización Electrónico que valida la factura.
 */
@Data
public class CaeResponse {
    private String cae;               // Ej: "71234567891234"
    private LocalDate caeVencimiento; // Fecha de vencimiento del CAE (10 días hábiles)
    private Long nroComprobante;      // Número asignado por AFIP
    private String resultado;         // "A" = Aprobado, "R" = Rechazado
    private String observaciones;     // Mensajes de AFIP si hay errores
}
