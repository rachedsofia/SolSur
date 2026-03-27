package com.solsur.afip;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

/**
 * Endpoints de integración con AFIP.
 */
@Slf4j
@RestController
@RequestMapping("/api/afip")
@RequiredArgsConstructor
public class AfipController {

    private final AfipWsfeService wsfeService;
    private final AfipConfig config;

    /**
     * Verifica si la integración AFIP está configurada y el certificado es válido.
     * Útil para mostrar el estado en el frontend.
     */
    @GetMapping("/estado")
    public ResponseEntity<Map<String, Object>> getEstado() {
        boolean configurado = config.getCuit() != null && !config.getCuit().isBlank()
            && config.getCertificadoPath() != null && !config.getCertificadoPath().isBlank();

        return ResponseEntity.ok(Map.of(
            "configurado", configurado,
            "homologacion", config.isHomologacion(),
            "cuit", config.getCuit().isBlank() ? "No configurado" : config.getCuit(),
            "puntoVenta", config.getPuntoVenta(),
            "ambiente", config.isHomologacion() ? "HOMOLOGACIÓN (pruebas)" : "PRODUCCIÓN"
        ));
    }

    /**
     * Prueba la conexión con AFIP obteniendo un token de autenticación.
     * Usar antes de emitir facturas para verificar que todo funciona.
     */
    @GetMapping("/test-conexion")
    public ResponseEntity<Map<String, Object>> testConexion() {
        try {
            AfipToken token = wsfeService.obtenerUltimoNroComprobante(null) >= 0
                ? new AfipToken("ok", "ok") : null;
            // Intenta obtener token real
            AfipToken t = new AfipTokenService(config).getToken();
            return ResponseEntity.ok(Map.of(
                "ok", true,
                "mensaje", "Conexión exitosa con AFIP",
                "ambiente", config.isHomologacion() ? "HOMOLOGACIÓN" : "PRODUCCIÓN"
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "ok", false,
                "mensaje", "Error al conectar con AFIP: " + e.getMessage()
            ));
        }
    }

    /**
     * Autoriza una factura en AFIP y devuelve el CAE.
     *
     * Body:
     * {
     *   "importe": 15000.00,
     *   "fecha": "2026-02-25",   (opcional, default: hoy)
     *   "concepto": 1            (1=Productos, 2=Servicios, 3=Ambos)
     * }
     */
    @PostMapping("/autorizar")
    public ResponseEntity<?> autorizarFactura(@RequestBody Map<String, Object> body) {
        try {
            double importe = Double.parseDouble(body.get("importe").toString());
            LocalDate fecha = body.containsKey("fecha")
                ? LocalDate.parse(body.get("fecha").toString())
                : LocalDate.now();
            int concepto = body.containsKey("concepto")
                ? Integer.parseInt(body.get("concepto").toString()) : 1;

            CaeResponse cae = wsfeService.autorizarFactura(importe, fecha, concepto);

            return ResponseEntity.ok(Map.of(
                "ok", true,
                "cae", cae.getCae(),
                "caeVencimiento", cae.getCaeVencimiento().toString(),
                "nroComprobante", cae.getNroComprobante(),
                "resultado", cae.getResultado(),
                "observaciones", cae.getObservaciones() != null ? cae.getObservaciones() : ""
            ));

        } catch (Exception e) {
            log.error("Error autorizando factura AFIP", e);
            return ResponseEntity.badRequest().body(Map.of(
                "ok", false,
                "error", e.getMessage()
            ));
        }
    }
}
