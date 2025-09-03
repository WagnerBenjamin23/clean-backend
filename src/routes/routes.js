const { Router } = require('express');
const rolesController = require('../controllers/rolesController');

const router = Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Ruta test funcionando' });
});

router.get('/roles', rolesController.testConnection);
module.exports = router;