package com.solsur.service;
import com.solsur.dto.*;
import com.solsur.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Transactional(readOnly=true)
public class DashboardService {
    private final SaleRepository saleRepo;
    private final SaleService saleService;
    private final ProductService productService;
    private static final BigDecimal IVA = BigDecimal.valueOf(1.21);
    private static final BigDecimal PURCHASES = new BigDecimal("235000");
    private static final String[] MONTHS = {"","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"};

    public DashboardStatsDTO getStats() {
        LocalDate s = LocalDate.now().withDayOfMonth(1), e = LocalDate.now();
        BigDecimal total = saleRepo.sumTotal(s, e);
        BigDecimal noIva = total.divide(IVA, 2, RoundingMode.HALF_UP);

        List<MonthlySaleDTO> monthly = saleRepo.monthlySales(LocalDate.now().getYear()).stream()
            .map(r -> MonthlySaleDTO.builder()
                .month(((Number)r[0]).intValue())
                .monthName(MONTHS[((Number)r[0]).intValue()])
                .amount((BigDecimal)r[1]).build())
            .collect(Collectors.toList());

        List<PaymentMethodStatsDTO> payments = saleRepo.salesByPayment(s, e).stream()
            .map(r -> PaymentMethodStatsDTO.builder()
                .method((String)r[0])
                .count(((Number)r[1]).longValue())
                .amount((BigDecimal)r[2]).build())
            .collect(Collectors.toList());

        return DashboardStatsDTO.builder()
            .totalSales(total).totalSalesNoIva(noIva)
            .pendingAmount(saleRepo.sumPending())
            .totalUnitsSold(saleRepo.sumUnits(s, e))
            .totalPurchases(PURCHASES).grossMargin(total.subtract(PURCHASES))
            .lowStockCount(productService.getLowStockCount())
            .outOfStockCount(productService.getOutOfStockCount())
            .totalProducts((int) productService.getTotalProducts())
            .monthlySales(monthly).paymentStats(payments)
            .recentSales(saleService.getRecent()).build();
    }
}
