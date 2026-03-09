package com.iglesia;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/offerings")
public class OfferingController {
    private final OfferingRepository offeringRepository;
    private final PersonRepository personRepository;
    private final PaymentRepository paymentRepository;
    private final ChurchRepository churchRepository;
    private final PaymentFactory paymentFactory;

    public OfferingController(OfferingRepository offeringRepository,
                              PersonRepository personRepository,
                              PaymentRepository paymentRepository,
                              ChurchRepository churchRepository,
                              PaymentFactory paymentFactory) {
        this.offeringRepository = offeringRepository;
        this.personRepository = personRepository;
        this.paymentRepository = paymentRepository;
        this.churchRepository = churchRepository;
        this.paymentFactory = paymentFactory;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')")
    @PostMapping
    public OfferingResponse create(@RequestBody OfferingRequest request) {
        Church church = requireChurch();
        Person person = personRepository.findById(request.personId())
            .orElseThrow(() -> ErrorResponseFactory.notFound("Persona no encontrada"));

        if (!person.getChurch().getId().equals(church.getId())) {
            throw ErrorResponseFactory.badRequest("Persona no pertenece a la iglesia");
        }

        Offering offering = new Offering();
        offering.setPerson(person);
        offering.setAmount(request.amount());
        offering.setConcept(request.concept());
        offering.setStatus(OfferingStatus.PENDIENTE);
        offeringRepository.save(offering);

        Payment payment = paymentFactory.createOfferingPayment(
            offering.getId(),
            request.amount()
        );
        paymentRepository.save(payment);

        offering.setPaymentId(payment.getId());
        offeringRepository.save(offering);

        return OfferingResponse.from(offering, payment);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')")
    @GetMapping
    public List<OfferingResponse> list() {
        Church church = requireChurch();
        return offeringRepository.findAllByPersonChurchId(church.getId())
            .stream()
            .map(offering -> {
                Payment payment = null;
                if (offering.getPaymentId() != null) {
                    payment = paymentRepository.findById(offering.getPaymentId()).orElse(null);
                }
                return OfferingResponse.from(offering, payment);
            })
            .toList();
    }

    private Church requireChurch() {
        return churchRepository.findAll()
            .stream()
            .findFirst()
            .orElseThrow(() -> ErrorResponseFactory.badRequest("Debe registrar una iglesia primero"));
    }

    public record OfferingRequest(
        @NotNull Long personId,
        @NotNull BigDecimal amount,
        @NotBlank String concept
    ) {}

    public record OfferingResponse(
        Long id,
        Long personId,
        String personName,
        String concept,
        String amount,
        String status,
        Long paymentId,
        String paymentStatus
    ) {
        public static OfferingResponse from(Offering offering, Payment payment) {
            String personName = offering.getPerson().getFirstName() + " " + offering.getPerson().getLastName();
            String paymentStatus = payment == null ? null : payment.getStatus().name();
            return new OfferingResponse(
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
}