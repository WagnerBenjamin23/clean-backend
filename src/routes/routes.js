const { Router } = require('express');
const rolesController = require('../controllers/rolesController');
const authController = require('../controllers/authController');
const productsController = require('../controllers/productsController');
const categoriesController = require('../controllers/categoriesController');
const {verifyToken} = require('../middlewares/verifyToken');
const upload = require('../middlewares/upload')

const router = Router();

router.get('/test', verifyToken, (req, res) => {
  res.json({ message: "Ruta test funcionando" });
});

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/roles', rolesController.testConnection);
router.get('/categories', categoriesController.getAllCategories)

router.post('/products', upload.array('images'), productsController.createProduct);
router.get('/products', productsController.getProducts);
router.patch('/products/:id/visibility', productsController.changeVisibility);
router.put('/products/:id', productsController.updateProduct);
router.delete('/products/:id', productsController.deleteProduct);
router.post('/products/:id/images', productsController.uploadProductImages);

module.exports = router;