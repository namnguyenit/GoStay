package com.gotravel.PaymentandWallet.mapper;

import com.gotravel.PaymentandWallet.dto.response.PaymentResponse;
import com.gotravel.PaymentandWallet.entity.PaymentRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    @Mapping(target = "paymentId", source = "id")
    @Mapping(target = "status", expression = "java(paymentRequest.getStatus().name())")
    PaymentResponse toPaymentResponse(PaymentRequest paymentRequest);
}
