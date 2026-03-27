package com.solsur.service;

import com.solsur.afip.*;
import com.solsur.dto.*;
import com.solsur.entity.*;
import com.solsur.exception.ResourceNotFoundException;
import com.solsur.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceService {

    private final InvoiceRepository repo;
    private final SaleRepository saleRepo;
    private final AfipWsfeService afipService;
    private final AfipConfig afipConfig;

    public List<InvoiceResponseDTO> findAll() {
        return repo.findAllByOrderByCreatedAtDesc().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public InvoiceResponseDTO create(InvoiceRequestDTO dto) {
        BigDecimal iva   = dto.getMontoNeto().multiply(dto.getAlicuotaIva())
                              .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal total = dto.getMontoNeto().add(iva);

        Invoice inv = Invoice.builder()
            .invoiceType(dto.getInvoiceType())
            .puntoVenta(dto.getPuntoVenta())
            .numero(dto.getNumero())
            .razonSocial(dto.getRazonSocial())
            .cuit(dto.getCuit())
            .domicilio(dto.getDomicilio())
            .condicionIva(dto.getCondicionIva())
            .concepto(dto.getConcepto())
            .montoNeto(dto.getMontoNeto())
            .alicuotaIva(dto.getAlicuotaIva())
            .montoIva(iva)
            .total(total)
            .fechaVencimiento(dto.getFechaVencimiento())
            .observaciones(dto.getObservaciones())
            .status("Borrador")
            .build();

        // Vincular venta si corresponde
        if (dto.getSaleId() != null) {
            Sale sale = saleRepo.findById(dto.getSaleId())
                .orElseThrow(() -> new ResourceNotFoundException("Venta", dto.getSaleId()));
            inv.setSale(sale);
            sale.setInvoiceStatus("Facturado");
            saleRepo.save(sale);
        }

        // ─── Autorizar en AFIP si está configurado ────────────────────────────
        if (afipConfig.getCuit() != null && !afipConfig.getCuit().isBlank()) {
            try {
                log.info("Solicitando CAE a AFIP para factura {} - ${}", dto.getNumero(), total);

                CaeResponse cae = afipService.autorizarFactura(
                    total.doubleValue(),
                    inv.getFechaEmision(),
                    1  // 1 = Productos
                );

                inv.setCae(cae.getCae());
                inv.setCaeVencimiento(cae.getCaeVencimiento());
                inv.setAfipNroComprobante(cae.getNroComprobante());
                inv.setAfipResultado(cae.getResultado());

                // Número de comprobante = el que asignó AFIP
                inv.setNumero(String.format("%08d", cae.getNroComprobante()));
                inv.setStatus("Emitida");

                log.info("✓ CAE obtenido: {} — Factura #{}", cae.getCae(), cae.getNroComprobante());

            } catch (Exception e) {
                // Si AFIP falla, guardar como borrador con el error en observaciones
                // No bloquear la operación — la dueña puede reintentarlo
                log.error("Error al obtener CAE de AFIP: {}", e.getMessage());
                inv.setStatus("Borrador");
                String obs = inv.getObservaciones() != null ? inv.getObservaciones() + " | " : "";
                inv.setObservaciones(obs + "Error AFIP: " + e.getMessage());
            }
        } else {
            log.debug("AFIP no configurado — factura guardada sin CAE");
        }

        return toDTO(repo.save(inv));
    }

    /**
     * Reintenta obtener el CAE de AFIP para una factura en estado Borrador.
     * Útil cuando AFIP estuvo caído al momento de emitir.
     */
    public InvoiceResponseDTO reintentarAfip(Long id) {
        Invoice inv = repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Factura", id));

        if (inv.getCae() != null && !inv.getCae().isBlank()) {
            throw new RuntimeException("Esta factura ya tiene CAE: " + inv.getCae());
        }

        try {
            CaeResponse cae = afipService.autorizarFactura(
                inv.getTotal().doubleValue(),
                inv.getFechaEmision(),
                1
            );
            inv.setCae(cae.getCae());
            inv.setCaeVencimiento(cae.getCaeVencimiento());
            inv.setAfipNroComprobante(cae.getNroComprobante());
            inv.setNumero(String.format("%08d", cae.getNroComprobante()));
            inv.setStatus("Emitida");
        } catch (Exception e) {
            throw new RuntimeException("Error al contactar AFIP: " + e.getMessage());
        }

        return toDTO(repo.save(inv));
    }

    public InvoiceResponseDTO updateStatus(Long id, String status) {
        Invoice i = repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Factura", id));
        i.setStatus(status);
        return toDTO(repo.save(i));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw new ResourceNotFoundException("Factura", id);
        repo.deleteById(id);
    }

    public InvoiceResponseDTO findById(Long id) {
        return toDTO(repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Factura", id)));
    }

    private InvoiceResponseDTO toDTO(Invoice i) {
        return InvoiceResponseDTO.builder()
            .id(i.getId())
            .invoiceType(i.getInvoiceType())
            .puntoVenta(i.getPuntoVenta())
            .numero(i.getNumero())
            .razonSocial(i.getRazonSocial())
            .cuit(i.getCuit())
            .domicilio(i.getDomicilio())
            .condicionIva(i.getCondicionIva())
            .concepto(i.getConcepto())
            .montoNeto(i.getMontoNeto())
            .alicuotaIva(i.getAlicuotaIva())
            .montoIva(i.getMontoIva())
            .total(i.getTotal())
            .fechaVencimiento(i.getFechaVencimiento())
            .fechaEmision(i.getFechaEmision())
            .status(i.getStatus())
            .observaciones(i.getObservaciones())
            .cae(i.getCae())
            .caeVencimiento(i.getCaeVencimiento())
            .createdAt(i.getCreatedAt())
            .build();
    }
}
