package com.elsebaey.ecommerce.product;

import com.elsebaey.ecommerce.exception.ProductPurchaseException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repository;
    private final ProductMapper mapper;

    public Integer createProduct(ProductRequest request) {
        var product = mapper.toProduct(request);
        return repository.save(product).getId();
    }

    public ProductResponse updateProduct(
            Integer productId,
            ProductRequest request
    ) {
        var product = repository.findById(productId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Product with id " + productId + " not found"
                        )
                );

        product.setName(request.name());
        product.setDescription(request.description());
        product.setAvailableQuantity(request.availableQuantity());
        product.setPrice(request.price());

        if (!product.getCategory().getId().equals(request.categoryId())) {
            product.setCategory(
                    mapper.toCategory(request.categoryId())
            );
        }

        return mapper.toProductResponse(repository.save(product));
    }

    public void deleteProduct(Integer productId) {
        var product = repository.findById(productId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Product with id " + productId + " not found"
                        )
                );

        repository.delete(product);
    }

    public ProductResponse updateStock(
            Integer productId,
            double quantity
    ) {
        var product = repository.findById(productId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Product with id " + productId + " not found"
                        )
                );

        product.setAvailableQuantity(quantity);

        return mapper.toProductResponse(repository.save(product));
    }

    public List<ProductPurchaseResponse> purchaseProducts(
            List<ProductPurchaseRequest> request
    ) {
        var productsIds = request.stream()
                .map(ProductPurchaseRequest::productId)
                .toList();

        var storedProducts =
                repository.findAllByIdInOrderById(productsIds);

        if (storedProducts.size() != productsIds.size()) {
            throw new ProductPurchaseException(
                    "one or more products does not exist"
            );
        }

        var storedRequest = request
                .stream()
                .sorted(
                        Comparator.comparing(
                                ProductPurchaseRequest::productId
                        )
                )
                .toList();

        var purchasedProducts =
                new ArrayList<ProductPurchaseResponse>();

        for (int i = 0; i < storedProducts.size(); i++) {

            var product = storedProducts.get(i);
            var productRequest = storedRequest.get(i);

            if (product.getAvailableQuantity()
                    < productRequest.quantity()) {

                throw new ProductPurchaseException(
                        "product with id " +
                        product.getId() +
                        " has insufficient quantity"
                );
            }

            var newAvailableQuantity =
                    product.getAvailableQuantity()
                            - productRequest.quantity();

            product.setAvailableQuantity(newAvailableQuantity);

            repository.save(product);

            purchasedProducts.add(
                    mapper.toProductPurchaseResponse(
                            product,
                            productRequest.quantity()
                    )
            );
        }

        return purchasedProducts;
    }

    public ProductResponse findById(Integer productId) {
        return repository.findById(productId)
                .map(mapper::toProductResponse)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Product with id " + productId +
                                " not found"
                        )
                );
    }

    public List<ProductResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toProductResponse)
                .toList();
    }

    public void restoreProducts(
            List<ProductRestoreRequest> request
    ) {
        var productIds = request.stream()
                .map(ProductRestoreRequest::productId)
                .toList();

        var storedProducts =
                repository.findAllByIdInOrderById(productIds);

        if (storedProducts.size() != productIds.size()) {
            throw new EntityNotFoundException(
                    "One or more products do not exist"
            );
        }

        for (ProductRestoreRequest restoreRequest : request) {

            var product = storedProducts.stream()
                    .filter(p ->
                            p.getId().equals(
                                    restoreRequest.productId()
                            )
                    )
                    .findFirst()
                    .orElseThrow(() ->
                            new EntityNotFoundException(
                                    "Product with id " +
                                    restoreRequest.productId() +
                                    " not found"
                            )
                    );

            product.setAvailableQuantity(
                    product.getAvailableQuantity()
                            + restoreRequest.quantity()
            );

            repository.save(product);
        }
    }
}