const db = require('../config/db');
const jwt = require('jsonwebtoken');

const authController = {
    register: async (req, res) => {
        try {
            console.log('Register endpoint body:', req.body);
            const { nombre, email, password } = req.body;

            if (!nombre || !email || !password) {
                return res.status(400).json({ error: 'Todos los campos son requeridos' });
            }

            // Verificar si existe
            const [existing] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
            if (existing.length > 0) {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }

            // Insertar usuario (Nota: En producción deberías hashear el password con bcrypt)
            const [result] = await db.execute('INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)', [nombre, email, password, 'usuario']);

            return res.status(201).json({ mensaje: 'Usuario registrado exitosamente', id: result.insertId });
        } catch (err) {
            console.error('Error en register:', err);
            return res.status(500).json({ error: 'Error al registrar usuario', detail: err.message });
        }
    },

    login: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y password son requeridos' });
        }

        try {
            const [users] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
            
            if (users.length === 0) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            const user = users[0];

            // Comparación simple (si usas bcrypt en el futuro, cambia esto por bcrypt.compare)
            if (user.password !== password) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, rol: user.rol },
                process.env.JWT_SECRET || 'secreto_biblioteca_seguro_123',
                { expiresIn: '24h' }
            );

            res.json({
                mensaje: 'Login exitoso',
                token,
                usuario: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }
            });
        } catch (error) {
            res.status(500).json({ error: 'Error en el servidor' });
        }
    },

    logout: (req, res) => {
        res.json({ mensaje: 'Logout exitoso' });
    }
};

module.exports = authController;
