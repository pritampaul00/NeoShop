package com.elsebaey.ecommerce.product;

import jakarta.validation.Valid;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService service;

    @PostMapping
    public ResponseEntity<Integer> createProduct(
            @RequestBody @Valid ProductRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.createProduct(request));
    }

    @PutMapping("/{product-id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable("product-id") Integer productId,
            @RequestBody @Valid ProductRequest request) {

        return ResponseEntity.ok(
                service.updateProduct(productId, request)
        );
    }

    @DeleteMapping("/{product-id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable("product-id") Integer productId) {

        service.deleteProduct(productId);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{product-id}/stock")
    public ResponseEntity<ProductResponse> updateStock(
            @PathVariable("product-id") Integer productId,
            @RequestParam
            @PositiveOrZero(message = "stock cannot be negative")
            double quantity) {

        return ResponseEntity.ok(
                service.updateStock(productId, quantity)
        );
    }

    @PostMapping("/purchase")
    public ResponseEntity<List<ProductPurchaseResponse>> purchaseProducts(
            @RequestBody List<ProductPurchaseRequest> request) {

        return ResponseEntity.ok(
                service.purchaseProducts(request)
        );
    }

    @GetMapping("/{product-id}")
    public ResponseEntity<ProductResponse> findById(
            @PathVariable("product-id") Integer productId) {

        return ResponseEntity.ok(
                service.findById(productId)
        );
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> findAll() {

        return ResponseEntity.ok(
                service.findAll()
        );
    }

    @PostMapping("/restore")
    public ResponseEntity<Void> restoreProducts(
            @RequestBody List<ProductRestoreRequest> request) {

        service.restoreProducts(request);

        return ResponseEntity.ok().build();
    }
}