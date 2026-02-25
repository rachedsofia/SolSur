package com.solsur.controller;

import com.solsur.dto.*;
import com.solsur.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController @RequestMapping("/api/sales") @RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;
    private final ExportService exportService;

    @GetMapping
    public ResponseEntity<List<SaleResponseDTO>> getAll(
        @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate start,
        @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(start != null && end != null ? saleService.findByRange(start, end) : saleService.findAll());
    }

    @GetMapping("/current-month")
    public ResponseEntity<List<SaleResponseDTO>> getCurrentMonth() { return ResponseEntity.ok(saleService.findCurrentMonth()); }

    @GetMapping("/{id}")
    public ResponseEntity<SaleResponseDTO> getById(@PathVariable Long id) { return ResponseEntity.ok(saleService.findById(id)); }

    @PostMapping
    public ResponseEntity<SaleResponseDTO> create(@Valid @RequestBody SaleRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(saleService.create(dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<SaleResponseDTO> updateStatus(@PathVariable Long id, @RequestBody Map<String,String> body) {
        return ResponseEntity.ok(saleService.updateStatus(id, body.get("status")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { saleService.delete(id); return ResponseEntity.noContent().build(); }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel(
        @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate start,
        @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate end) throws Exception {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ventas_solsur.xlsx")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(exportService.exportSalesExcel(start, end));
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf(
        @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate start,
        @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate end) throws Exception {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ventas_solsur.pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(exportService.exportSalesPdf(start, end));
    }
}
