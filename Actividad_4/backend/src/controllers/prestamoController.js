const db = require('../config/db');

const prestamoController = {
    getAll: async (req, res) => {
        try {
            const [rows] = await db.execute(`
                SELECT p.*, u.nombre as usuario_nombre, l.titulo as libro_titulo 
                FROM prestamos p
                JOIN usuarios u ON p.usuario_id = u.id
                JOIN libros l ON p.libro_id = l.id
                ORDER BY p.created_at DESC
            `);
            res.json({ prestamos: rows });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener los préstamos' });
        }
    },

    getById: async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await db.execute(`
                SELECT p.*, u.nombre as usuario_nombre, l.titulo as libro_titulo 
                FROM prestamos p
                JOIN usuarios u ON p.usuario_id = u.id
                JOIN libros l ON p.libro_id = l.id
                WHERE p.id = ?
            `, [id]);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Préstamo no encontrado' });
            }
            res.json({ prestamo: rows[0] });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener el préstamo' });
        }
    },

    create: async (req, res) => {
        const { usuario_id, libro_id, fecha_prestamo, fecha_devolucion } = req.body;
        const userId = req.userId;

        if (!libro_id || !fecha_prestamo || !fecha_devolucion) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }

        const usuarioId = usuario_id || userId;

        try {
            const [libro] = await db.execute('SELECT * FROM libros WHERE id = ?', [libro_id]);
            if (libro.length === 0) {
                return res.status(404).json({ error: 'Libro no encontrado' });
            }

            if (libro[0].disponible < 1) {
                return res.status(400).json({ error: 'No hay ejemplares disponibles' });
            }

            const [result] = await db.execute(
                'INSERT INTO prestamos (usuario_id, libro_id, fecha_prestamo, fecha_devolucion) VALUES (?, ?, ?, ?)',
                [usuarioId, libro_id, fecha_prestamo, fecha_devolucion]
            );

            await db.execute('UPDATE libros SET disponible = disponible - 1 WHERE id = ?', [libro_id]);

            res.status(201).json({ mensaje: 'Préstamo creado exitosamente', id: result.insertId });
        } catch (error) {
            res.status(500).json({ error: 'Error al crear el préstamo' });
        }
    },

    update: async (req, res) => {
        const { id } = req.params;
        const { estado } = req.body;

        try {
            const [existing] = await db.execute('SELECT * FROM prestamos WHERE id = ?', [id]);
            if (existing.length === 0) {
                return res.status(404).json({ error: 'Préstamo no encontrado' });
            }

            if (estado === 'devuelto' && existing[0].estado !== 'devuelto') {
                await db.execute('UPDATE libros SET disponible = disponible + 1 WHERE id = ?', [existing[0].libro_id]);
            }

            await db.execute('UPDATE prestamos SET estado = ? WHERE id = ?', [estado || existing[0].estado, id]);
            res.json({ mensaje: 'Préstamo actualizado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar el préstamo' });
        }
    },

    delete: async (req, res) => {
        const { id } = req.params;

        try {
            const [existing] = await db.execute('SELECT * FROM prestamos WHERE id = ?', [id]);
            if (existing.length === 0) {
                return res.status(404).json({ error: 'Préstamo no encontrado' });
            }

            if (existing[0].estado === 'activo') {
                await db.execute('UPDATE libros SET disponible = disponible + 1 WHERE id = ?', [existing[0].libro_id]);
            }

            await db.execute('DELETE FROM prestamos WHERE id = ?', [id]);
            res.json({ mensaje: 'Préstamo eliminado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar el préstamo' });
        }
    }
};

module.exports = prestamoController;
