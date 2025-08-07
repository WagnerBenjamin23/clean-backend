const { Router } = require('express');

const router = Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Ruta test funcionando' });
});

module.exports = router;