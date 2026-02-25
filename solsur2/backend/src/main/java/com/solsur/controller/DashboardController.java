package com.solsur.controller;
import com.solsur.dto.DashboardStatsDTO;
import com.solsur.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/dashboard") @RequiredArgsConstructor
public class DashboardController {
    private final DashboardService service;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats() { return ResponseEntity.ok(service.getStats()); }
}
