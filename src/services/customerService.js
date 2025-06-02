

/*
####################################################################
# customerService.js
####################################################################
*/
// src/services/customerService.js
import api from './api';

const customerService = {
    // GET /customer (Admin/Staff only)
    getAllContacts: async (pageIndex = 1, pageSize = 10, sortDir) => {
        const params = {
            // Backend CustomerCareService uses 0-based page index for PageRequest.of
            pageIndex: pageIndex > 0 ? pageIndex : 1, // But API example uses 1-based
            pageSize,
        };
        if (sortDir) params.sortDir = sortDir;
        try {
            const response = await api.get('/customer', { params });
            // Assuming example is correct and this endpoint uses 1-based for request.
            return response; // ApiResponse<PageResponse<CustomerCareResponse>>
        } catch (error) {
            console.error('Get all customer contacts failed:', error.message || error);
            throw error;
        }
    },

    // GET /customer/{id} (Admin/Staff only)
    getContactById: async (contactId) => {
        try {
            const response = await api.get(`/customer/${contactId}`);
            return response; // ApiResponse<CustomerCareResponse>
        } catch (error) {
            console.error(`Get customer contact ${contactId} failed:`, error.message || error);
            throw error;
        }
    },

    // POST /customer
    createContact: async (contactData) => { // { name, phone, email, address, content }
        try {
            const response = await api.post('/customer', contactData);
            return response; // ApiResponse<CustomerCareResponse>
        } catch (error) {
            console.error('Create customer contact failed:', error.message || error);
            throw error;
        }
    },

    // DELETE /customer/{id} (Admin/Staff only)
    deleteContact: async (contactId) => {
        try {
            const response = await api.delete(`/customer/${contactId}`);
            return response; // ApiResponse<Void>
        } catch (error) {
            console.error(`Delete customer contact ${contactId} failed:`, error.message || error);
            throw error;
        }
    },

    // POST /customer/seeding/{numberOfRecords} (Admin/Staff only)
    seedContacts: async (numberOfRecords) => {
        try {
            const response = await api.post(`/customer/seeding/${numberOfRecords}`);
            return response; // ApiResponse<String>
        } catch (error) {
            console.error('Seed customer contacts failed:', error.message || error);
            throw error;
        }
    },
};
export default customerService;