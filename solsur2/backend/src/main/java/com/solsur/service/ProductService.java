package com.solsur.service;
import com.solsur.dto.*;
import com.solsur.entity.Product;
import com.solsur.exception.*;
import com.solsur.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Transactional
public class ProductService {
    private final ProductRepository repo;

    public List<ProductResponseDTO> findAll() { return repo.findAll().stream().map(this::toDTO).collect(Collectors.toList()); }
    public List<ProductResponseDTO> search(String q) { return repo.searchProducts(q).stream().map(this::toDTO).collect(Collectors.toList()); }
    public List<ProductResponseDTO> getLowStock(int t) { return repo.findLowStock(t).stream().map(this::toDTO).collect(Collectors.toList()); }

    public ProductResponseDTO findById(Long id) {
        return toDTO(repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Producto", id)));
    }

    public ProductResponseDTO create(ProductRequestDTO dto) {
        if (repo.existsByCode(dto.getCode())) throw new BusinessException("Ya existe un producto con codigo: " + dto.getCode());
        return toDTO(repo.save(toEntity(dto)));
    }

    public ProductResponseDTO update(Long id, ProductRequestDTO dto) {
        Product p = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Producto", id));
        if (repo.existsByCodeAndIdNot(dto.getCode(), id)) throw new BusinessException("Codigo duplicado: " + dto.getCode());
        p.setCode(dto.getCode()); p.setName(dto.getName()); p.setCategory(dto.getCategory());
        p.setSize(dto.getSize()); p.setColor(dto.getColor()); p.setStock(dto.getStock());
        p.setCostPrice(dto.getCostPrice()); p.setSalePrice(dto.getSalePrice());
        p.setDescription(dto.getDescription());
        p.setHasPromotion(dto.getHasPromotion() != null && dto.getHasPromotion());
        p.setPromotionType(dto.getPromotionType()); p.setPromotionDiscount(dto.getPromotionDiscount());
        return toDTO(repo.save(p));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw new ResourceNotFoundException("Producto", id);
        repo.deleteById(id);
    }

    public void decrementStock(Long id, int qty) {
        Product p = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Producto", id));
        if (p.getStock() < qty) throw new BusinessException("Stock insuficiente. Disponible: " + p.getStock());
        p.setStock(p.getStock() - qty); repo.save(p);
    }

    public void incrementStock(Long id, int qty) {
        Product p = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Producto", id));
        p.setStock(p.getStock() + qty); repo.save(p);
    }

    public Product getEntity(Long id) { return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Producto", id)); }

    public int getLowStockCount() { return repo.findLowStock(3).size(); }
    public int getOutOfStockCount() { return repo.findOutOfStock().size(); }
    public long getTotalProducts() { return repo.count(); }

    private Product toEntity(ProductRequestDTO d) {
        return Product.builder().code(d.getCode()).name(d.getName()).category(d.getCategory())
            .size(d.getSize()).color(d.getColor()).stock(d.getStock()).costPrice(d.getCostPrice())
            .salePrice(d.getSalePrice()).description(d.getDescription())
            .hasPromotion(d.getHasPromotion() != null && d.getHasPromotion())
            .promotionType(d.getPromotionType()).promotionDiscount(d.getPromotionDiscount()).build();
    }

    public ProductResponseDTO toDTO(Product p) {
        return ProductResponseDTO.builder().id(p.getId()).code(p.getCode()).name(p.getName())
            .category(p.getCategory()).size(p.getSize()).color(p.getColor()).stock(p.getStock())
            .costPrice(p.getCostPrice()).salePrice(p.getSalePrice()).description(p.getDescription())
            .hasPromotion(p.getHasPromotion()).promotionType(p.getPromotionType())
            .promotionDiscount(p.getPromotionDiscount())
            .createdAt(p.getCreatedAt()).updatedAt(p.getUpdatedAt()).build();
    }
}
