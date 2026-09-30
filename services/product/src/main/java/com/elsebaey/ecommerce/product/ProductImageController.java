package com.elsebaey.ecommerce.product;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductImageController {

    private final ProductImageService imageService;

    @PostMapping(
            value = "/{productId}/images",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<List<String>> uploadImages(
            @PathVariable Integer productId,
            @RequestParam("images") List<MultipartFile> images
    ) throws IOException {

        return ResponseEntity.ok(
                imageService.uploadImages(productId, images)
        );
    }

    @GetMapping("/{productId}/images/{fileName}")
    public ResponseEntity<ByteArrayResource> getImage(
            @PathVariable Integer productId,
            @PathVariable String fileName
    ) throws IOException {

        byte[] image =
                imageService.getImage(productId, fileName);

        MediaType mediaType = MediaType.IMAGE_JPEG;

        if (fileName.toLowerCase().endsWith(".png")) {
            mediaType = MediaType.IMAGE_PNG;
        } else if (fileName.toLowerCase().endsWith(".webp")) {
            mediaType = MediaType.parseMediaType("image/webp");
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(new ByteArrayResource(image));
    }
}