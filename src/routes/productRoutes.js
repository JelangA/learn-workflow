const express = require('express');

const router = express.Router();
const productController = require('../controllers/productController');
const verifyToken = require('../middleware/verifyToken');
const validateProduct = require('../validation/productValidation');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected routes
router.post('/', verifyToken, validateProduct, productController.createProduct);
// router.post('/bulk', verifyToken, productController.createManyProducts);
router.put(
    '/:id',
    verifyToken,
    validateProduct,
    productController.updateProduct
);
router.delete('/:id', verifyToken, productController.deleteProduct);

module.exports = router;
