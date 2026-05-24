package com.gotravel.PaymentandWallet.mapper;

import com.gotravel.PaymentandWallet.dto.response.HostPayoutResponse;
import com.gotravel.PaymentandWallet.dto.response.PaymentResponse;
import com.gotravel.PaymentandWallet.entity.HostPayout;
import com.gotravel.PaymentandWallet.entity.PaymentRequest;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-18T16:07:41+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 23.0.1 (Oracle Corporation)"
)
@Component
public class PaymentMapperImpl implements PaymentMapper {

    @Override
    public PaymentResponse toPaymentResponse(PaymentRequest paymentRequest) {
        if ( paymentRequest == null ) {
            return null;
        }

        PaymentResponse.PaymentResponseBuilder paymentResponse = PaymentResponse.builder();

        paymentResponse.paymentId( paymentRequest.getId() );
        paymentResponse.orderId( paymentRequest.getOrderId() );
        paymentResponse.paymentCode( paymentRequest.getPaymentCode() );
        paymentResponse.amount( paymentRequest.getAmount() );
        paymentResponse.qrUrl( paymentRequest.getQrUrl() );
        paymentResponse.bankAccount( paymentRequest.getBankAccount() );
        paymentResponse.bankName( paymentRequest.getBankName() );
        paymentResponse.expiresAt( paymentRequest.getExpiresAt() );
        paymentResponse.paidAt( paymentRequest.getPaidAt() );
        paymentResponse.createdAt( paymentRequest.getCreatedAt() );

        paymentResponse.status( paymentRequest.getStatus().name() );

        return paymentResponse.build();
    }

    @Override
    public HostPayoutResponse toHostPayoutResponse(HostPayout hostPayout) {
        if ( hostPayout == null ) {
            return null;
        }

        HostPayoutResponse.HostPayoutResponseBuilder hostPayoutResponse = HostPayoutResponse.builder();

        hostPayoutResponse.payoutId( hostPayout.getId() );
        hostPayoutResponse.orderId( hostPayout.getOrderId() );
        hostPayoutResponse.hostId( hostPayout.getHostId() );
        hostPayoutResponse.totalAmount( hostPayout.getTotalAmount() );
        hostPayoutResponse.commissionRate( hostPayout.getCommissionRate() );
        hostPayoutResponse.commissionAmount( hostPayout.getCommissionAmount() );
        hostPayoutResponse.hostAmount( hostPayout.getHostAmount() );
        hostPayoutResponse.paidAt( hostPayout.getPaidAt() );
        hostPayoutResponse.createdAt( hostPayout.getCreatedAt() );

        hostPayoutResponse.status( hostPayout.getStatus().name() );

        return hostPayoutResponse.build();
    }
}
