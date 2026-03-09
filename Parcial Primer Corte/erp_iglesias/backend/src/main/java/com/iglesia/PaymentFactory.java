package com.iglesia;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
public class PaymentFactory {

    public Payment createEnrollmentPayment(Long enrollmentId, BigDecimal amount) {

        Payment payment = new Payment();
        payment.setType(PaymentType.INSCRIPCION_CURSO);
        payment.setAmount(amount);
        payment.setReferenceId(enrollmentId);
        payment.setStatus(PaymentStatus.INICIADO);
        payment.setAttempts(0);

        return payment;
    }

    public Payment createOfferingPayment(Long offeringId, BigDecimal amount) {

        Payment payment = new Payment();
        payment.setType(PaymentType.OFRENDA);
        payment.setAmount(amount);
        payment.setReferenceId(offeringId);
        payment.setStatus(PaymentStatus.INICIADO);
        payment.setAttempts(0);

        return payment;
    }
}