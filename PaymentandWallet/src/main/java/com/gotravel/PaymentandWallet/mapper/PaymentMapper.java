package com.gotravel.PaymentandWallet.mapper;

import com.gotravel.PaymentandWallet.dto.response.HostPayoutResponse;
import com.gotravel.PaymentandWallet.dto.response.PaymentResponse;
import com.gotravel.PaymentandWallet.entity.HostPayout;
import com.gotravel.PaymentandWallet.entity.PaymentRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface PaymentMapper {


    @Mapping(target = "paymentId", source = "id")
    @Mapping(target = "status", expression = "java(paymentRequest.getStatus().name())")
    PaymentResponse toPaymentResponse(PaymentRequest paymentRequest);

    @Mapping(target = "payoutId", source = "id")
    @Mapping(target = "status", expression = "java(hostPayout.getStatus().name())")
    HostPayoutResponse toHostPayoutResponse(HostPayout hostPayout);
}
