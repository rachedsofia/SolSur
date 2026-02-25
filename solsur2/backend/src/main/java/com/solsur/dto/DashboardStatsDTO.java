package com.solsur.dto;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardStatsDTO {
    private BigDecimal totalSales, totalSalesNoIva, pendingAmount, totalPurchases, grossMargin;
    private Integer totalUnitsSold, lowStockCount, outOfStockCount, totalProducts;
    private List<MonthlySaleDTO> monthlySales;
    private List<PaymentMethodStatsDTO> paymentStats;
    private List<SaleResponseDTO> recentSales;
}
