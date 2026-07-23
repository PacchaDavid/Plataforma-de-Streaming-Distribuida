package com.streaming.recomendaciones;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RecomendacionesApplication {
    public static void main(String[] args) {
        SpringApplication.run(RecomendacionesApplication.class, args);
    }
}
