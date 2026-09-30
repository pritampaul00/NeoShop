package com.elsebaey.ecommerce.product;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductImageService {

    private final ProductRepository productRepository;

    @Value("${product.image.upload-dir:uploads/products}")
    private String uploadDir;

    public List<String> uploadImages(
            Integer productId,
            List<MultipartFile> files
    ) throws IOException {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Product with id " + productId + " not found"
                        )
                );

        Path productDirectory = Paths.get(
                uploadDir,
                String.valueOf(productId)
        );

        Files.createDirectories(productDirectory);

        for (MultipartFile file : files) {

            if (file.isEmpty()) {
                continue;
            }

            String originalName = file.getOriginalFilename();

            if (originalName == null || originalName.isBlank()) {
                continue;
            }

            String extension = "";

            int dotIndex = originalName.lastIndexOf(".");

            if (dotIndex >= 0) {
                extension = originalName.substring(dotIndex);
            }

            String fileName =
                    UUID.randomUUID() + extension;

            Path filePath =
                    productDirectory.resolve(fileName);

            Files.copy(
                    file.getInputStream(),
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            product.getImageUrls().add(
                    "/api/v1/products/"
                            + productId
                            + "/images/"
                            + fileName
            );
        }

        productRepository.save(product);

        return product.getImageUrls();
    }

    public byte[] getImage(
        Integer productId,
        String fileName
) throws IOException {

    Path filePath = Paths.get(
            uploadDir,
            String.valueOf(productId),
            fileName
    );

    if (!Files.exists(filePath)) {
        throw new IllegalArgumentException(
                "Image not found"
        );
    }

    return Files.readAllBytes(filePath);
}
}