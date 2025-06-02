

/*
####################################################################
# productService.js
####################################################################
*/
// src/services/productService.js
import api from './api';

const productService = {
    // GET /product
    getAllProducts: async (filter = {}, pageIndex = 1, pageSize = 10) => {
        const params = {
            ...filter,
            pageIndex: pageIndex > 0 ? pageIndex : 1, // API example uses 1-based
            pageSize,
        };
        try {
            const response = await api.get('/product', { params });
            return response; // ApiResponse<PageResponse<ProductResponse>>
        } catch (error) {
            console.error('Get all products failed:', error.message || error);
            throw error;
        }
    },

    // GET /product/active
    getActiveProducts: async (filter = {}, pageIndex = 1, pageSize = 10) => {
        const params = {
            ...filter,
            pageIndex: pageIndex > 0 ? pageIndex : 1, // API example uses 1-based
            pageSize,
        };
        try {
            const response = await api.get('/product/active', { params });
            return response; // ApiResponse<PageResponse<ProductResponse>>
        } catch (error) {
            console.error('Get active products failed:', error.message || error);
            throw error;
        }
    },

    // GET /product/top-discount
    getTopDiscountProducts: async () => {
        try {
            const response = await api.get('/product/top-discount');
            return response; // ApiResponse<List<ProductResponse>>
        } catch (error) {
            console.error('Get top discount products failed:', error.message || error);
            throw error;
        }
    },

    // GET /product/top-rating
    getTopRatingProducts: async () => {
        try {
            const response = await api.get('/product/top-rating');
            return response; // ApiResponse<List<ProductResponse>>
        } catch (error) {
            console.error('Get top rating products failed:', error.message || error);
            throw error;
        }
    },

    // GET /product/{productId}
    getProductById: async (productId) => {
        try {
            const response = await api.get(`/product/${productId}`);
            return response; // ApiResponse<ProductResponse>
        } catch (error) {
            console.error(`Get product ${productId} failed:`, error.message || error);
            throw error;
        }
    },

    // POST /product (Admin/Staff only)
    createProduct: async (productData, thumbnailFile, imageFiles = []) => {
        // productData: ProductRequest DTO
        const formData = new FormData();
        formData.append('product', JSON.stringify(productData));
        formData.append('thumbnail', {
            uri: thumbnailFile.uri,
            name: thumbnailFile.fileName || `thumb-${Date.now()}`,
            type: thumbnailFile.mimeType || 'image/jpeg',
        });
        imageFiles.forEach((file, index) => {
            formData.append('images', {
                uri: file.uri,
                name: file.fileName || `image-${index}-${Date.now()}`,
                type: file.mimeType || 'image/jpeg',
            });
        });
        try {
            const response = await api.post('/product', formData);
            return response; // ApiResponse<ProductResponse>
        } catch (error) {
            console.error('Create product failed:', error.message || error);
            throw error;
        }
    },

    // PUT /product/{productId} (Admin/Staff only)
    updateProduct: async (productId, productData, thumbnailFile = null, imageFiles = []) => {
        const formData = new FormData();
        formData.append('product', JSON.stringify(productData));
        if (thumbnailFile) {
            formData.append('thumbnail', {
                uri: thumbnailFile.uri,
                name: thumbnailFile.fileName || `thumb-update-${Date.now()}`,
                type: thumbnailFile.mimeType || 'image/jpeg',
            });
        }
        if (imageFiles && imageFiles.length > 0) {
            imageFiles.forEach((file, index) => {
                formData.append('images', {
                    uri: file.uri,
                    name: file.fileName || `image-update-${index}-${Date.now()}`,
                    type: file.mimeType || 'image/jpeg',
                });
            });
        }
        try {
            const response = await api.put(`/product/${productId}`, formData);
            return response; // ApiResponse<ProductResponse>
        } catch (error) {
            console.error(`Update product ${productId} failed:`, error.message || error);
            throw error;
        }
    },

    // DELETE /product/{productId} (Admin/Staff only)
    deleteProduct: async (productId) => {
        try {
            const response = await api.delete(`/product/${productId}`);
            return response; // ApiResponse<ProductResponse> (or Void/message)
        } catch (error) {
            console.error(`Delete product ${productId} failed:`, error.message || error);
            throw error;
        }
    },

    // PUT /product/active/{id} (Admin/Staff only)
    updateProductStatus: async (productId, isActive) => {
        try {
            const response = await api.put(`/product/active/${productId}`, isActive, {
                headers: { 'Content-Type': 'application/json' } // Ensure correct content type for boolean body
            });
            return response; // ApiResponse<ProductResponse>
        } catch (error) {
            console.error(`Update product ${productId} status failed:`, error.message || error);
            throw error;
        }
    },

    // === Product Category Routes (within Product Service) ===
    // GET /product/category
    getProductCategories: async () => {
        try {
            const response = await api.get('/product/category');
            return response; // ApiResponse<List<CategoryResponse>>
        } catch (error) {
            console.error('Get product categories failed:', error.message || error);
            throw error;
        }
    },

    // === Product Rate Routes (within Product Service) ===
    // GET /product/rate
    getAllProductRates: async (pageIndex = 1, pageSize = 10) => {
        try {
            const response = await api.get('/product/rate', {
                params: { pageIndex: pageIndex > 0 ? pageIndex : 1, pageSize } // API example uses 1-based
            });
            return response; // ApiResponse<PageResponse<RateResponse>>
        } catch (error) {
            console.error('Get all product rates failed:', error.message || error);
            throw error;
        }
    },

    // GET /product/rate/{id}
    getRateById: async (rateId) => {
        try {
            const response = await api.get(`/product/rate/${rateId}`);
            return response; // ApiResponse<RateResponse>
        } catch (error) {
            console.error(`Get rate ${rateId} failed:`, error.message || error);
            throw error;
        }
    },

    // GET /product/rate/product/{productId}
    getRatesByProductId: async (productId, pageIndex = 1, pageSize = 10) => {
        try {
            const response = await api.get(`/product/rate/product/${productId}`, {
                params: { pageIndex: pageIndex > 0 ? pageIndex : 1, pageSize } // API example uses 1-based
            });
            return response; // ApiResponse<PageResponse<RateResponse>>
        } catch (error) {
            console.error(`Get rates for product ${productId} failed:`, error.message || error);
            throw error;
        }
    },

    // POST /product/rate
    createRate: async (rateData) => { // { productId, vote, comment }
        try {
            const response = await api.post('/product/rate', rateData);
            return response; // ApiResponse<RateResponse>
        } catch (error) {
            console.error('Create rate failed:', error.message || error);
            throw error;
        }
    },

    // DELETE /product/rate/{id}
    deleteRate: async (rateId) => {
        try {
            const response = await api.delete(`/product/rate/${rateId}`);
            return response; // ApiResponse<RateResponse> (or Void/message)
        } catch (error) {
            console.error(`Delete rate ${rateId} failed:`, error.message || error);
            throw error;
        }
    },
};
export default productService;