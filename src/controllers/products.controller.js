import {
	createProduct,
	getAllProducts,
	getProductById,
	updateProduct,
	deleteProduct
} from '../services/products.services.js';

export const createProductController = async (req, res) => {
	try {
		const product = await createProduct(req.body);
		res.status(201).json(product);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

export const getAllProductsController = async (req, res) => {
	try {
		const products = await getAllProducts();
		res.json(products);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

export const getProductByIdController = async (req, res) => {
	try {
		const product = await getProductById(req.params.id);
		if (!product) return res.status(404).json({ error: 'Product not found' });
		res.json(product);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

export const updateProductController = async (req, res) => {
	try {
		const product = await updateProduct(req.params.id, req.body);
		if (!product) return res.status(404).json({ error: 'Product not found' });
		res.json(product);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

export const deleteProductController = async (req, res) => {
	try {
		const product = await deleteProduct(req.params.id);
		if (!product) return res.status(404).json({ error: 'Product not found' });
		res.json({ message: 'Product deleted' });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};
