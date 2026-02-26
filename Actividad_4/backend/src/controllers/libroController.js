const db = require('../config/db');

const libroController = {
    getAll: async (req, res) => {
        try {
            const [rows] = await db.execute('SELECT * FROM libros');
            res.json({ libros: rows });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener libros' });
        }
    },

    getById: async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await db.execute('SELECT * FROM libros WHERE id = ?', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Libro no encontrado' });
            }
            res.json({ libro: rows[0] });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener el libro' });
        }
    },

    create: async (req, res) => {
        const { titulo, autor, isbn, cantidad } = req.body;

        if (!titulo || !autor) {
            return res.status(400).json({ error: 'Título y autor son requeridos' });
        }

        try {
            const [result] = await db.execute(
                'INSERT INTO libros (titulo, autor, isbn, cantidad, disponible) VALUES (?, ?, ?, ?, ?)',
                [titulo, autor, isbn || null, cantidad || 1, cantidad || 1]
            );
            res.status(201).json({ mensaje: 'Libro creado exitosamente', id: result.insertId });
        } catch (error) {
            res.status(500).json({ error: 'Error al crear el libro' });
        }
    },

    update: async (req, res) => {
        const { id } = req.params;
        const { titulo, autor, isbn, cantidad } = req.body;

        try {
            // Nota: Esta es una actualización simple. En un caso real, si cambias la cantidad total,
            // deberías ajustar 'disponible' acorde a la diferencia.
            const [result] = await db.execute(
                'UPDATE libros SET titulo = ?, autor = ?, isbn = ?, cantidad = ? WHERE id = ?',
                [titulo, autor, isbn, cantidad, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Libro no encontrado' });
            }
            res.json({ mensaje: 'Libro actualizado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar el libro' });
        }
    },

    delete: async (req, res) => {
        const { id } = req.params;
        try {
            const [result] = await db.execute('DELETE FROM libros WHERE id = ?', [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Libro no encontrado' });
            }
            res.json({ mensaje: 'Libro eliminado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar el libro' });
        }
    }
};

module.exports = libroController;