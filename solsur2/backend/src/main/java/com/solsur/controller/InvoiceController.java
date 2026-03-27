package com.solsur.controller;

import com.solsur.dto.*;
import com.solsur.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController @RequestMapping("/api/invoices") @RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final ExportService exportService;

    @GetMapping
    public ResponseEntity<List<InvoiceResponseDTO>> getAll() { return ResponseEntity.ok(invoiceService.findAll()); }

    @PostMapping
    public ResponseEntity<InvoiceResponseDTO> create(@Valid @RequestBody InvoiceRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.create(dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<InvoiceResponseDTO> updateStatus(@PathVariable Long id, @RequestBody Map<String,String> body) {
        return ResponseEntity.ok(invoiceService.updateStatus(id, body.get("status")));
    }

    @PostMapping("/{id}/reintentar-afip")
    public ResponseEntity<InvoiceResponseDTO> reintentarAfip(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.reintentarAfip(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { invoiceService.delete(id); return ResponseEntity.noContent().build(); }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel() throws Exception {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=facturas_solsur.xlsx")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(exportService.exportInvoicesExcel());
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf() throws Exception {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=facturas_solsur.pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(exportService.exportInvoicesPdf());
    }
}
