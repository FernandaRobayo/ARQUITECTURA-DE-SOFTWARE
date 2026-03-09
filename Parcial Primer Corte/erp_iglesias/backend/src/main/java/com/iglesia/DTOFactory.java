package com.iglesia;

public class DTOFactory {

    private DTOFactory() {
    }

    public static EnrollmentController.EnrollmentResponse enrollmentDTO(
            Enrollment enrollment,
            Payment payment
    ) {

        String personName =
                enrollment.getPerson().getFirstName()
                        + " "
                        + enrollment.getPerson().getLastName();

        String paymentStatus =
                payment == null ? null : payment.getStatus().name();

        return new EnrollmentController.EnrollmentResponse(
                enrollment.getId(),
                enrollment.getPerson().getId(),
                personName,
                enrollment.getCourse().getId(),
                enrollment.getCourse().getName(),
                enrollment.getStatus().name(),
                enrollment.getPaymentId(),
                paymentStatus
        );
    }

    public static OfferingController.OfferingResponse offeringDTO(
            Offering offering,
            Payment payment
    ) {

        String personName =
                offering.getPerson().getFirstName()
                        + " "
                        + offering.getPerson().getLastName();

        String paymentStatus =
                payment == null ? null : payment.getStatus().name();

        return new OfferingController.OfferingResponse(
                offering.getId(),
                offering.getPerson().getId(),
                personName,
                offering.getConcept(),
                offering.getAmount().toPlainString(),
                offering.getStatus().name(),
                offering.getPaymentId(),
                paymentStatus
        );
    }
}