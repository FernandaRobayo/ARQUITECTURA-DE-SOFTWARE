public class Main {
    public static void main(String[] args) {
        // Usuario 1: Con todos los parámetros requeridos
        Usuario u1 = Usuario.builder()
                .nombre("Juan")
                .apellido("García")
                .email("juan@email.com")
                .telefono("555-0001")
                .direccion("Calle Principal 100")
                .edad(30)
                .esAdmin(true)
                .esActivo(true)
                .genero("M")
                .build();

        // Usuario 2: Con todos los parámetros requeridos
        Usuario u2 = Usuario.builder()
                .nombre("Carlos")
                .apellido("Perez")
                .email("perez@email.com")
                .telefono("555-1111")
                .direccion("Avenida Central 50")
                .edad(28)
                .esAdmin(false)
                .esActivo(true)
                .genero("M")
                .build();

        // Usuario 3: Con todos los parámetros requeridos
        Usuario u3 = Usuario.builder()
                .nombre("Ana")
                .apellido("Lopez")
                .email("ana@email.com")
                .telefono("555-2222")
                .direccion("Calle 123")
                .edad(25)
                .esAdmin(true)
                .esActivo(true)
                .genero("F")
                .build();

        System.out.println(u1);
        System.out.println(u2);
        System.out.println(u3);
    }
}