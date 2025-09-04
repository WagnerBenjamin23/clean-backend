const { Router } = require('express');
const rolesController = require('../controllers/rolesController');
const authController = require('../controllers/authController');
const {verifyToken} = require('../middlewares/verifyToken');

const router = Router();

router.get('/test', verifyToken, (req, res) => {
  res.json({ message: 'Ruta test funcionando' });
});

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/roles', rolesController.testConnection);
module.exports = router;