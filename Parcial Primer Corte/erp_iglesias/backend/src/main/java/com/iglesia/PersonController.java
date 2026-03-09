package com.iglesia;

import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/people")
public class PersonController {
    private final PersonRepository personRepository;
    private final ChurchRepository churchRepository;

    public PersonController(PersonRepository personRepository, ChurchRepository churchRepository) {
        this.personRepository = personRepository;
        this.churchRepository = churchRepository;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')")
    @PostMapping
    public PersonResponse create(@RequestBody PersonRequest request) {
        Church church = requireChurch();
        Person person = new Person();
        person.setFirstName(request.firstName());
        person.setLastName(request.lastName());
        person.setDocument(request.document());
        person.setPhone(request.phone());
        person.setEmail(request.email());
        person.setChurch(church);
        personRepository.save(person);
        return PersonResponse.from(person);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')")
    @GetMapping
    public List<PersonResponse> list() {
        Church church = requireChurch();
        return personRepository.findAllByChurchId(church.getId())
            .stream()
            .map(PersonResponse::from)
            .toList();
    }

    private Church requireChurch() {
        return churchRepository.findAll()
            .stream()
            .findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debe registrar una iglesia primero"));
    }

    public record PersonRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        String document,
        String phone,
        String email
    ) {}

    public record PersonResponse(
        Long id,
        String firstName,
        String lastName,
        String document,
        String phone,
        String email
    ) {
        public static PersonResponse from(Person person) {
            return new PersonResponse(
                person.getId(),
                person.getFirstName(),
                person.getLastName(),
                person.getDocument(),
                person.getPhone(),
                person.getEmail()
            );
        }
    }
}
