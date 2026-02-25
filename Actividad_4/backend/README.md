# Sistema de Gestión de Biblioteca

Aplicación web para gestionar libros y préstamos de una biblioteca.

## Requisitos

- Node.js 18+
- MySQL 8.0+

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   cd backend
   npm install
   ```

3. Configurar MySQL:
   - Crear la base de datos ejecutando:
   ```bash
   mysql -u root -p < src/config/database.sql
   ```

4. Configurar variables de entorno en `.env`:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_contraseña
   DB_NAME=biblioteca_db
   JWT_SECRET=tu_secreto
   ```

## Ejecutar

```bash
npm start
```

La aplicación estará en http://localhost:3000

## Pruebas

```bash
npm test
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

### Libros (requiere JWT)
- `GET /api/libros` - Listar todos los libros
- `GET /api/libros/:id` - Obtener un libro
- `POST /api/libros` - Crear libro
- `PUT /api/libros/:id` - Actualizar libro
- `DELETE /api/libros/:id` - Eliminar libro

### Préstamos (requiere JWT)
- `GET /api/prestamos` - Listar préstamos
- `POST /api/prestamos` - Crear préstamo
- `PUT /api/prestamos/:id` - Actualizar préstamo
- `DELETE /api/prestamos/:id` - Eliminar préstamo
