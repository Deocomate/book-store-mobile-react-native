
/*
####################################################################
# categoryService.js
####################################################################
*/
// src/services/categoryService.js
import api from './api';

const categoryService = {
    // GET /category
    getAllCategories: async (name, isAsc) => {
        const params = {};
        if (name) params.name = name;
        if (isAsc !== undefined) params.isAsc = isAsc;
        try {
            const response = await api.get('/category', { params });
            return response; // ApiResponse<List<CategoryResponse>> (tree structure)
        } catch (error) {
            console.error('Get all categories failed:', error.message || error);
            throw error;
        }
    },

    // GET /category/{id}
    getCategoryById: async (categoryId) => {
        try {
            const response = await api.get(`/category/${categoryId}`);
            return response; // ApiResponse<CategoryTreeResponse>
        } catch (error) {
            console.error(`Get category ${categoryId} failed:`, error.message || error);
            throw error;
        }
    },

    // POST /category (Admin/Staff only)
    createCategory: async (categoryData) => { // { name, priority, parentId, type }
        try {
            const response = await api.post('/category', categoryData);
            return response; // ApiResponse<CategoryResponse>
        } catch (error) {
            console.error('Create category failed:', error.message || error);
            throw error;
        }
    },

    // PUT /category/{id} (Admin/Staff only)
    updateCategory: async (categoryId, categoryData) => { // { name, priority, parentId, type }
        try {
            const response = await api.put(`/category/${categoryId}`, categoryData);
            return response; // ApiResponse<CategoryResponse>
        } catch (error) {
            console.error(`Update category ${categoryId} failed:`, error.message || error);
            throw error;
        }
    },

    // DELETE /category/{id} (Admin/Staff only)
    deleteCategory: async (categoryId) => {
        try {
            const response = await api.delete(`/category/${categoryId}`);
            return response; // ApiResponse<Void>
        } catch (error) {
            console.error(`Delete category ${categoryId} failed:`, error.message || error);
            throw error;
        }
    },

    // POST /category/seeding/{numberOfRecords} (Admin/Staff only)
    seedCategories: async (numberOfRecords) => {
        try {
            const response = await api.post(`/category/seeding/${numberOfRecords}`);
            return response; // ApiResponse<String>
        } catch (error) {
            console.error('Seed categories failed:', error.message || error);
            throw error;
        }
    },
};
export default categoryService;