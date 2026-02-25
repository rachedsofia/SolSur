package com.solsur.repository;
import com.solsur.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsByCode(String code);
    boolean existsByCodeAndIdNot(String code, Long id);

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%',:s,'%')) OR LOWER(p.code) LIKE LOWER(CONCAT('%',:s,'%')) OR LOWER(p.category) LIKE LOWER(CONCAT('%',:s,'%'))")
    List<Product> searchProducts(@Param("s") String search);

    @Query("SELECT p FROM Product p WHERE p.stock <= :t ORDER BY p.stock ASC")
    List<Product> findLowStock(@Param("t") int threshold);

    @Query("SELECT p FROM Product p WHERE p.stock = 0")
    List<Product> findOutOfStock();
}
