package com.elsebaey.ecommerce.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();

        restTemplate.getInterceptors().add((request, body, execution) -> {
            var attributes = RequestContextHolder.getRequestAttributes();

            if (attributes instanceof ServletRequestAttributes servletAttributes) {
                HttpServletRequest currentRequest =
                        servletAttributes.getRequest();

                String authorization =
                        currentRequest.getHeader("Authorization");

                if (authorization != null && !authorization.isBlank()) {
                    request.getHeaders().set(
                            "Authorization",
                            authorization
                    );
                }
            }

            return execution.execute(request, body);
        });

        return restTemplate;
    }
}