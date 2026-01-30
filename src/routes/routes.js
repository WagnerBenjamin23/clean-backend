const { Router } = require('express');
const rolesController = require('../controllers/rolesController');
const authController = require('../controllers/authController');
const productsController = require('../controllers/productsController');
const categoriesController = require('../controllers/categoriesController');
const combosController = require('../controllers/combosController');
const dashboardController = require('../controllers/dashboardController');

const {verifyToken} = require('../middlewares/verifyToken');
const upload = require('../middlewares/upload');
const apiKey = require('../middlewares/apiKey');


const router = Router();

router.use(apiKey);

router.get('/test', verifyToken, (req, res) => {
  res.json({ message: "Ruta test funcionando" });
});

router.post('/register', verifyToken, authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/roles', rolesController.testConnection);

router.get('/categories', categoriesController.getAllCategories)

router.get('/dashboard/metrics', verifyToken, dashboardController.getDashboardStats);

router.post('/categories',verifyToken, categoriesController.saveCategory);
router.get('/categories', categoriesController.getAllCategories)
router.delete('/categories/:id', verifyToken, categoriesController.deleteCategory);
router.put('/categories/:id', verifyToken, categoriesController.updateCategory);

router.post('/products', verifyToken,upload.array('images'), productsController.createProduct);
router.get('/products', productsController.getProducts);
router.patch('/products/:id/visibility', verifyToken, productsController.changeVisibility);
router.put('/products/:id', verifyToken, productsController.updateProduct);
router.delete('/products/:id', verifyToken, productsController.deleteProduct);
router.post('/products/:id/images', verifyToken, productsController.uploadProductImages);
router.get('/products/latest', productsController.getLatestProducts);

router.post('/combos', verifyToken,  combosController.createCombo);
router.get('/combos',  combosController.getCombos);
router.put('/combos/:id', verifyToken,combosController.updateCombos);
router.delete('/combos/:id', verifyToken, combosController.deleteCombo);


module.exports = router;