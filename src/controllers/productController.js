const axios = require('axios');

class ProductController {
    // Get all products
    async getAllProducts(req, res) {
        try {
            console.log('Fetching all products');
            const response = await axios.get(
                `${process.env.FIREBASE_URL}/products.json`
            );

            if (!response.data) {
                console.log('No products found');
                return res.status(200).json([]);
            }

            // Convert Firebase object to array
            const products = Object.entries(response.data).map(([id, data]) => ({
                id,
                ...data,
            }));

            console.log(`Found ${products.length} products`);
            res.status(200).json(products);
        } catch (error) {
            console.error('Error fetching products:', error.message);
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
            });
        }
    }

    // Get single product by ID
    async getProductById(req, res) {
        try {
            const {id} = req.params;
            console.log('Fetching product with ID:', id);
            const response = await axios.get(
                `${process.env.FIREBASE_URL}/products/${id}.json`
            );
            console.log('Response data:', response.data);

            if (!response.data) {
                console.log('Product not found for ID:', id);
                return res.status(404).json({
                    error: 'Not Found',
                    message: 'Product not found',
                });
            }

            // Return the product data with its ID
            res.status(200).json({
                id, // Include the Firebase key as id
                ...response.data,
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
            });
        }
    }

    // Create multiple products
    async createManyProducts(req, res) {
        try {
            const products = req.body;

            if (!Array.isArray(products)) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'Expected an array of products',
                });
            }

            const created = [];

            for (const product of products) {
                const response = await axios.post(
                    `${process.env.FIREBASE_URL}/products.json`,
                    product
                );
                created.push({
                    id: response.data.name,
                    ...product,
                });
            }

            res.status(201).json({
                message: `${created.length} products created successfully`,
                products: created,
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
            });
        }
    }

    // Create new product
    async createProduct(req, res) {
        try {
            const response = await axios.post(
                `${process.env.FIREBASE_URL}/products.json`,
                req.body
            );

            if (!response.data || !response.data.name) {
                throw new Error('Failed to create product');
            }

            res.status(201).json({
                id: response.data.name,
                ...req.body,
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
            });
        }
    }

    // Update product by ID
    async updateProduct(req, res) {
        try {
            const {id} = req.params;

            // Check if product exists
            const checkResponse = await axios.get(
                `${process.env.FIREBASE_URL}/products/${id}.json`
            );

            if (!checkResponse.data) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: 'Product not found while updating',
                });
            }

            const response = await axios.put(
                `${process.env.FIREBASE_URL}/products/${id}.json`,
                req.body
            );

            res.status(200).json({
                id,
                ...response.data,
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
            });
        }
    }

    // Delete product by ID
    async deleteProduct(req, res) {
        try {
            const {id} = req.params;

            // Check if product exists
            const checkResponse = await axios.get(
                `${process.env.FIREBASE_URL}/products/${id}.json`
            );

            if (!checkResponse.data) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: 'Product not found',
                });
            }

            await axios.delete(`${process.env.FIREBASE_URL}/products/${id}.json`);

            res.status(200).json({
                message: 'Product successfully deleted',
                id,
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
            });
        }
    }
}

module.exports = new ProductController();
