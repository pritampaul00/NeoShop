package com.elsebaey.ecommerce.category;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService service;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> findAll() {
        return ResponseEntity.ok(
                service.findAll()
        );
    }

    @GetMapping("/{category-id}")
    public ResponseEntity<CategoryResponse> findById(
            @PathVariable("category-id") Integer categoryId) {

        return ResponseEntity.ok(
                service.findById(categoryId)
        );
    }
}