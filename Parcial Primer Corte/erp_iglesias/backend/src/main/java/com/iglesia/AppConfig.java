package com.iglesia;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Bean
    public DatabaseSettings databaseSettings() {
        return DatabaseSettings.getInstance();
    }

}