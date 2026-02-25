const express = require('express');
const router = express.Router();
const libroController = require('../controllers/libroController');
const verifyToken = require('../middlewares/auth');

router.get('/', verifyToken, libroController.getAll);
router.get('/:id', verifyToken, libroController.getById);
router.post('/', verifyToken, libroController.create);
router.put('/:id', verifyToken, libroController.update);
router.delete('/:id', verifyToken, libroController.delete);

module.exports = router;
