package com.solsur.service;
import com.solsur.dto.*;
import com.solsur.entity.*;
import com.solsur.exception.ResourceNotFoundException;
import com.solsur.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Transactional
public class InvoiceService {
    private final InvoiceRepository repo;
    private final SaleRepository saleRepo;

    public List<InvoiceResponseDTO> findAll() { return repo.findAllByOrderByCreatedAtDesc().stream().map(this::toDTO).collect(Collectors.toList()); }

    public InvoiceResponseDTO create(InvoiceRequestDTO dto) {
        BigDecimal iva   = dto.getMontoNeto().multiply(dto.getAlicuotaIva()).divide(BigDecimal.valueOf(100),2,RoundingMode.HALF_UP);
        BigDecimal total = dto.getMontoNeto().add(iva);
        Invoice inv = Invoice.builder()
            .invoiceType(dto.getInvoiceType()).puntoVenta(dto.getPuntoVenta()).numero(dto.getNumero())
            .razonSocial(dto.getRazonSocial()).cuit(dto.getCuit()).domicilio(dto.getDomicilio())
            .condicionIva(dto.getCondicionIva()).concepto(dto.getConcepto())
            .montoNeto(dto.getMontoNeto()).alicuotaIva(dto.getAlicuotaIva())
            .montoIva(iva).total(total)
            .fechaVencimiento(dto.getFechaVencimiento()).observaciones(dto.getObservaciones()).build();
        if (dto.getSaleId() != null) {
            Sale sale = saleRepo.findById(dto.getSaleId()).orElseThrow(() -> new ResourceNotFoundException("Venta", dto.getSaleId()));
            inv.setSale(sale);
            sale.setInvoiceStatus("Facturado");
            saleRepo.save(sale);
        }
        return toDTO(repo.save(inv));
    }

    public InvoiceResponseDTO updateStatus(Long id, String status) {
        Invoice i = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Factura", id));
        i.setStatus(status);
        return toDTO(repo.save(i));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw new ResourceNotFoundException("Factura", id);
        repo.deleteById(id);
    }

    private InvoiceResponseDTO toDTO(Invoice i) {
        return InvoiceResponseDTO.builder().id(i.getId())
            .invoiceType(i.getInvoiceType()).puntoVenta(i.getPuntoVenta()).numero(i.getNumero())
            .razonSocial(i.getRazonSocial()).cuit(i.getCuit()).domicilio(i.getDomicilio())
            .condicionIva(i.getCondicionIva()).concepto(i.getConcepto())
            .montoNeto(i.getMontoNeto()).alicuotaIva(i.getAlicuotaIva())
            .montoIva(i.getMontoIva()).total(i.getTotal())
            .fechaVencimiento(i.getFechaVencimiento()).fechaEmision(i.getFechaEmision())
            .status(i.getStatus()).observaciones(i.getObservaciones()).createdAt(i.getCreatedAt()).build();
    }
}
