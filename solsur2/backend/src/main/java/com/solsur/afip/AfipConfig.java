package com.solsur.afip;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

/**
 * Configuración AFIP — completar con los datos reales cuando
 * se obtenga el certificado digital de AFIP.
 *
 * Estas propiedades se leen desde application.properties o
 * variables de entorno (para Railway/producción).
 */
@Configuration
@ConfigurationProperties(prefix = "afip")
@Data
public class AfipConfig {

    /**
     * Modo de operación:
     *   true  = HOMOLOGACIÓN (pruebas, no genera facturas reales)
     *   false = PRODUCCIÓN   (facturas reales con validez legal)
     *
     * Siempre empezar con homologacion=true para probar.
     */
    private boolean homologacion = true;

    /**
     * CUIT del emisor (sin guiones).
     * Ejemplo: 20123456789
     */
    private String cuit = "";

    /**
     * Número del punto de venta creado en AFIP.
     * Ejemplo: 1  (para el punto de venta "0001")
     */
    private int puntoVenta = 1;

    /**
     * Ruta al certificado .crt entregado por AFIP.
     * Ejemplo: C:/solsur/certificado-afip.crt
     */
    private String certificadoPath = "";

    /**
     * Ruta a la clave privada .key generada junto al certificado.
     * Ejemplo: C:/solsur/clave-privada.key
     */
    private String clavePrivadaPath = "";

    // ─── URLs de los Web Services de AFIP ────────────────────────────────────

    public String getWsaaUrl() {
        return homologacion
            ? "https://wsaahomo.afip.gov.ar/ws/services/LoginCms"
            : "https://wsaa.afip.gov.ar/ws/services/LoginCms";
    }

    public String getWsfeUrl() {
        return homologacion
            ? "https://wsfehomo.afip.gov.ar/wsfev1/service.asmx"
            : "https://wsfe.afip.gov.ar/wsfev1/service.asmx";
    }
}
