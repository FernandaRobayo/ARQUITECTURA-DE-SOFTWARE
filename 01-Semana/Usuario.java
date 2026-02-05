public class Usuario {
    private final String nombre;
    private final String apellido;
    private final String email;
    private final String telefono;
    private final String direccion;
    private final Integer edad;
    private final Boolean esAdmin;
    private final Boolean esActivo;
    private final String genero;

    private Usuario(UsuarioBuilder builder) {
        this.nombre = builder.nombre;
        this.apellido = builder.apellido;
        this.email = builder.email;
        this.telefono = builder.telefono;
        this.direccion = builder.direccion;
        this.edad = builder.edad;
        this.esAdmin = builder.esAdmin;
        this.esActivo = builder.esActivo;
        this.genero = builder.genero;
    }

    public static UsuarioBuilder builder() {
        return new UsuarioBuilder();
    }

    @Override
    public String toString() {
        return "Usuario{" +
                "nombre='" + nombre + '\'' +
                ", apellido='" + apellido + '\'' +
                ", email='" + email + '\'' +
                ", telefono='" + telefono + '\'' +
                ", direccion='" + direccion + '\'' +
                ", edad=" + edad +
                ", esAdmin=" + esAdmin +
                ", esActivo=" + esActivo +
                ", genero='" + genero + '\'' +
                '}';
    }

    // Clase Builder
    public static class UsuarioBuilder {
        private String nombre;
        private String apellido;
        private String email;
        private String telefono;
        private String direccion;
        private Integer edad;
        private Boolean esAdmin = false;
        private Boolean esActivo = true;
        private String genero;

        public UsuarioBuilder nombre(String nombre) {
            if (nombre == null || nombre.trim().isEmpty()) {
                throw new IllegalArgumentException("El nombre no puede ser nulo o vacío");
            }
            this.nombre = nombre;
            return this;
        }

        public UsuarioBuilder apellido(String apellido) {
            if (apellido == null || apellido.trim().isEmpty()) {
                throw new IllegalArgumentException("El apellido no puede ser nulo o vacío");
            }
            this.apellido = apellido;
            return this;
        }

        public UsuarioBuilder email(String email) {
            if (email == null || email.trim().isEmpty()) {
                throw new IllegalArgumentException("El email no puede ser nulo o vacío");
            }
            this.email = email;
            return this;
        }

        public UsuarioBuilder telefono(String telefono) {
            if (telefono == null || telefono.trim().isEmpty()) {
                throw new IllegalArgumentException("El teléfono no puede ser nulo o vacío");
            }
            this.telefono = telefono;
            return this;
        }

        public UsuarioBuilder direccion(String direccion) {
            if (direccion == null || direccion.trim().isEmpty()) {
                throw new IllegalArgumentException("La dirección no puede ser nula o vacía");
            }
            this.direccion = direccion;
            return this;
        }

        public UsuarioBuilder edad(Integer edad) {
            if (edad == null || edad <= 0) {
                throw new IllegalArgumentException("La edad debe ser un número positivo");
            }
            this.edad = edad;
            return this;
        }

        public UsuarioBuilder esAdmin(Boolean esAdmin) {
            if (esAdmin == null) {
                throw new IllegalArgumentException("esAdmin no puede ser nulo");
            }
            this.esAdmin = esAdmin;
            return this;
        }

        public UsuarioBuilder esActivo(Boolean esActivo) {
            if (esActivo == null) {
                throw new IllegalArgumentException("esActivo no puede ser nulo");
            }
            this.esActivo = esActivo;
            return this;
        }

        public UsuarioBuilder genero(String genero) {
            if (genero == null || genero.trim().isEmpty()) {
                throw new IllegalArgumentException("El género no puede ser nulo o vacío");
            }
            this.genero = genero;
            return this;
        }

        public Usuario build() {
            if (nombre == null)
                throw new IllegalArgumentException("nombre es requerido");
            if (apellido == null)
                throw new IllegalArgumentException("apellido es requerido");
            if (email == null)
                throw new IllegalArgumentException("email es requerido");
            if (telefono == null)
                throw new IllegalArgumentException("telefono es requerido");
            if (direccion == null)
                throw new IllegalArgumentException("direccion es requerida");
            if (edad == null)
                throw new IllegalArgumentException("edad es requerida");
            if (genero == null)
                throw new IllegalArgumentException("genero es requerido");

            return new Usuario(this);
        }
    }
}