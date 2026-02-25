package com.solsur.service;
import com.solsur.dto.*;
import com.solsur.entity.*;
import com.solsur.exception.ResourceNotFoundException;
import com.solsur.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Transactional
public class SaleService {
    private final SaleRepository repo;
    private final ProductService productService;

    public List<SaleResponseDTO> findAll() { return repo.findAll().stream().map(this::toDTO).collect(Collectors.toList()); }

    public List<SaleResponseDTO> findByRange(LocalDate s, LocalDate e) {
        return repo.findByDateBetweenOrderByDateDesc(s, e).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<SaleResponseDTO> findCurrentMonth() {
        return findByRange(LocalDate.now().withDayOfMonth(1), LocalDate.now());
    }

    public SaleResponseDTO findById(Long id) {
        return toDTO(repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Venta", id)));
    }

    public SaleResponseDTO create(SaleRequestDTO dto) {
        Product product = productService.getEntity(dto.getProductId());
        productService.decrementStock(dto.getProductId(), dto.getQuantity());
        BigDecimal unit  = product.getSalePrice();
        BigDecimal total = unit.multiply(BigDecimal.valueOf(dto.getQuantity()));
        Sale sale = Sale.builder()
            .date(dto.getDate() != null ? dto.getDate() : LocalDate.now())
            .client(dto.getClient()).clientCuit(dto.getClientCuit())
            .product(product).productName(product.getName())
            .quantity(dto.getQuantity()).unitPrice(unit).totalAmount(total)
            .paymentMethod(dto.getPaymentMethod())
            .invoiceStatus(dto.getInvoiceStatus() != null ? dto.getInvoiceStatus() : "Pendiente")
            .notes(dto.getNotes()).build();
        return toDTO(repo.save(sale));
    }

    public SaleResponseDTO updateStatus(Long id, String status) {
        Sale s = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Venta", id));
        s.setInvoiceStatus(status);
        return toDTO(repo.save(s));
    }

    public void delete(Long id) {
        Sale s = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Venta", id));
        productService.incrementStock(s.getProduct().getId(), s.getQuantity());
        repo.deleteById(id);
    }

    public BigDecimal getTotalCurrentMonth() { return repo.sumTotal(LocalDate.now().withDayOfMonth(1), LocalDate.now()); }
    public Integer getUnitsCurrentMonth()    { return repo.sumUnits(LocalDate.now().withDayOfMonth(1), LocalDate.now()); }
    public BigDecimal getPending()           { return repo.sumPending(); }
    public List<SaleResponseDTO> getRecent() { return repo.findRecent(PageRequest.of(0,10)).stream().map(this::toDTO).collect(Collectors.toList()); }

    public SaleResponseDTO toDTO(Sale s) {
        return SaleResponseDTO.builder().id(s.getId()).date(s.getDate())
            .client(s.getClient()).clientCuit(s.getClientCuit())
            .productId(s.getProduct() != null ? s.getProduct().getId() : null)
            .productName(s.getProductName()).quantity(s.getQuantity())
            .unitPrice(s.getUnitPrice()).totalAmount(s.getTotalAmount())
            .paymentMethod(s.getPaymentMethod()).invoiceStatus(s.getInvoiceStatus())
            .invoiceNumber(s.getInvoiceNumber()).notes(s.getNotes())
            .createdAt(s.getCreatedAt()).build();
    }
}
