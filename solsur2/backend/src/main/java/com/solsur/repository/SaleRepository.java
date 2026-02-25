package com.solsur.repository;
import com.solsur.entity.Sale;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findByDateBetweenOrderByDateDesc(LocalDate start, LocalDate end);

    @Query("SELECT COALESCE(SUM(s.totalAmount),0) FROM Sale s WHERE s.date BETWEEN :s AND :e")
    BigDecimal sumTotal(@Param("s") LocalDate start, @Param("e") LocalDate end);

    @Query("SELECT COALESCE(SUM(s.quantity),0) FROM Sale s WHERE s.date BETWEEN :s AND :e")
    Integer sumUnits(@Param("s") LocalDate start, @Param("e") LocalDate end);

    @Query("SELECT COALESCE(SUM(s.totalAmount),0) FROM Sale s WHERE s.invoiceStatus='Pendiente'")
    BigDecimal sumPending();

    @Query("SELECT s.paymentMethod, COUNT(s), SUM(s.totalAmount) FROM Sale s WHERE s.date BETWEEN :s AND :e GROUP BY s.paymentMethod")
    List<Object[]> salesByPayment(@Param("s") LocalDate start, @Param("e") LocalDate end);

    @Query("SELECT MONTH(s.date), SUM(s.totalAmount) FROM Sale s WHERE YEAR(s.date)=:y GROUP BY MONTH(s.date) ORDER BY MONTH(s.date)")
    List<Object[]> monthlySales(@Param("y") int year);

    @Query("SELECT s FROM Sale s ORDER BY s.date DESC")
    List<Sale> findRecent(Pageable p);
}
