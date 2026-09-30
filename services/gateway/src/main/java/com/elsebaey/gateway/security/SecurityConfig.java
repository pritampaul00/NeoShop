package com.elsebaey.gateway.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(
            ServerHttpSecurity http) {

        http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(cors -> {})
                .authorizeExchange(exchange -> exchange
                        .pathMatchers("/eureka/**").permitAll()

                        // Public product browsing
                        .pathMatchers(
                                HttpMethod.GET,
                                "/api/v1/products",
                                "/api/v1/products/**"
                        ).permitAll()

                        // Public product images
                        .pathMatchers(
                                HttpMethod.GET,
                                "/api/v1/products/*/images/**"
                        ).permitAll()

                        // Public category browsing
                        .pathMatchers(
                                HttpMethod.GET,
                                "/api/v1/categories",
                                "/api/v1/categories/**"
                        ).permitAll()

                        // Admin APIs
                        .pathMatchers("/api/v1/admin/**")
                        .hasRole("ADMIN")

                        // Everything else requires authentication
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt -> {

                            JwtAuthenticationConverter converter =
                                    new JwtAuthenticationConverter();

                            converter.setJwtGrantedAuthoritiesConverter(
                                    new KeycloakRoleConverter()
                            );

                            jwt.jwtAuthenticationConverter(
                                    new ReactiveJwtAuthenticationConverterAdapter(
                                            converter
                                    )
                            );
                        }));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.addAllowedOrigin(
                "http://localhost:5173"
        );
        configuration.addAllowedHeader("*");
        configuration.addAllowedMethod("*");
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}