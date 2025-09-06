import express from 'express';
import {
    createProductController,
    getAllProductsController,
    getProductByIdController,
    updateProductController,
    deleteProductController
} from '../controllers/products.controller.js';

const router = express.Router();

router.post('/', createProductController);
router.get('/', getAllProductsController);
router.get('/:id', getProductByIdController);
router.put('/:id', updateProductController);
router.delete('/:id', deleteProductController);

export default router;
