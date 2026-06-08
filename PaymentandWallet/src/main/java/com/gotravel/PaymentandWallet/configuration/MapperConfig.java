package com.gotravel.PaymentandWallet.configuration;

import com.gotravel.PaymentandWallet.mapper.PaymentMapper;
import org.mapstruct.factory.Mappers;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MapperConfig {

    @Bean
    public PaymentMapper paymentMapper() {
        return Mappers.getMapper(PaymentMapper.class);
    }
}
