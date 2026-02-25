process.env.JWT_SECRET = 'secreto_biblioteca_seguro_123';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../config/db', () => ({
    execute: jest.fn()
}));

const db = require('../config/db');
const app = require('../app');

describe('Rutas de Autenticación', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('POST /api/auth/register debe crear un usuario nuevo', async () => {
        db.execute
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([{ insertId: 1 }]);

        const response = await request(app)
            .post('/api/auth/register')
            .send({ nombre: 'Juan', email: 'juan@test.com', password: '123' })
            .expect(201);

        expect(response.body).toHaveProperty('mensaje');
    });

    test('POST /api/auth/register debe retornar error si falta email', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({ nombre: 'Juan', password: '123' })
            .expect(400);

        expect(response.body).toHaveProperty('error');
    });

    test('POST /api/auth/login debe iniciar sesión correctamente', async () => {
        const hashedPassword = require('bcryptjs').hashSync('123', 10);
        db.execute.mockResolvedValueOnce([[{ 
            id: 1, 
            nombre: 'Juan', 
            email: 'juan@test.com', 
            password: hashedPassword, 
            rol: 'usuario' 
        }]]);

        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'juan@test.com', password: '123' })
            .expect(200);

        expect(response.body).toHaveProperty('token');
    });

    test('POST /api/auth/login debe retornar error con credenciales inválidas', async () => {
        db.execute.mockResolvedValueOnce([[]]);

        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'noexiste@test.com', password: 'wrongpass' })
            .expect(401);

        expect(response.body).toHaveProperty('error');
    });

    test('POST /api/auth/logout debe cerrar sesión', async () => {
        const response = await request(app)
            .post('/api/auth/logout')
            .expect(200);

        expect(response.body).toHaveProperty('mensaje');
    });
});

describe('Rutas de Libros', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign(
            { id: 1, email: 'test@test.com', rol: 'admin' },
            'secreto_biblioteca_seguro_123',
            { expiresIn: '1h' }
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/libros debe retornar lista de libros', async () => {
        db.execute.mockResolvedValueOnce([[{ id: 1, titulo: 'Libro 1' }]]);

        const response = await request(app)
            .get('/api/libros')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toHaveProperty('libros');
    });

    test('GET /api/libros debe requerir token', async () => {
        const response = await request(app)
            .get('/api/libros')
            .expect(403);

        expect(response.body).toHaveProperty('error');
    });

    test('POST /api/libros debe crear un libro nuevo', async () => {
        db.execute.mockResolvedValueOnce([{ insertId: 1 }]);

        const response = await request(app)
            .post('/api/libros')
            .set('Authorization', `Bearer ${token}`)
            .send({ titulo: 'El Principito', autor: 'Saint-Exupéry' })
            .expect(201);

        expect(response.body).toHaveProperty('mensaje');
    });

    test('POST /api/libros debe retornar error si falta título', async () => {
        const response = await request(app)
            .post('/api/libros')
            .set('Authorization', `Bearer ${token}`)
            .send({ autor: 'Autor' })
            .expect(400);

        expect(response.body).toHaveProperty('error');
    });
});

describe('Rutas de Préstamos', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign(
            { id: 1, email: 'test@test.com', rol: 'admin' },
            'secreto_biblioteca_seguro_123',
            { expiresIn: '1h' }
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/prestamos debe retornar lista de préstamos', async () => {
        db.execute.mockResolvedValueOnce([[{ id: 1 }]]);

        const response = await request(app)
            .get('/api/prestamos')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toHaveProperty('prestamos');
    });

    test('GET /api/prestamos debe requerir token', async () => {
        const response = await request(app)
            .get('/api/prestamos')
            .expect(403);

        expect(response.body).toHaveProperty('error');
    });

    test('POST /api/prestamos debe crear un préstamo', async () => {
        db.execute
            .mockResolvedValueOnce([[{ id: 1, disponible: 2 }]])
            .mockResolvedValueOnce([{ insertId: 1 }])
            .mockResolvedValueOnce([{ affectedRows: 1 }]);

        const response = await request(app)
            .post('/api/prestamos')
            .set('Authorization', `Bearer ${token}`)
            .send({ libro_id: 1, fecha_prestamo: '2024-01-15', fecha_devolucion: '2024-01-29' })
            .expect(201);

        expect(response.body).toHaveProperty('mensaje');
    });
});
