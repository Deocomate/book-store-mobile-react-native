


/*
####################################################################
# cartService.js
####################################################################
*/
// src/services/cartService.js
import api from './api';

const cartService = {
    // POST /cart/cart-products
    addProductToCart: async (cartProductData) => { // { productId, quantity }
        try {
            const response = await api.post('/cart/cart-products', cartProductData);
            return response; // ApiResponse<CartProductResponse>
        } catch (error) {
            console.error('Add product to cart failed:', error.message || error);
            throw error;
        }
    },

    // DELETE /cart/cart-products
    removeProductsFromCart: async (cartProductIds) => { // Array<integer>
        try {
            const response = await api.delete('/cart/cart-products', { data: cartProductIds });
            return response; // ApiResponse<string>
        } catch (error) {
            console.error('Remove products from cart failed:', error.message || error);
            throw error;
        }
    },

    // GET /cart - Assuming this endpoint exists to get the current user's cart
    // This is needed for CartContext to function as described
    getMyCart: async () => {
        try {
            // This endpoint is not explicitly in your backend controller snippets or api_endpoints.txt
            // but is a common requirement.
            const response = await api.get('/cart');
            return response; // Example: ApiResponse<{ id: number, userId: number, cartProducts: CartProductResponse[] }>
        } catch (error) {
            console.error('Get my cart failed:', error.message || error);
            // Return an empty cart structure or throw, depending on how UI handles it
            return { status: error.status || 500, message: error.message || "Failed to fetch cart", result: { cartProducts: [] }, timestamp: new Date().toISOString() };
        }
    },

    // PUT /cart/cart-products/{cartProductId} - Assuming this endpoint for updating quantity
    // This is also not in the spec but is a common cart operation.
    updateCartItemQuantity: async (cartProductId, quantity) => {
        try {
            const response = await api.put(`/cart/cart-products/${cartProductId}`, { quantity });
            return response; // ApiResponse<CartProductResponse>
        } catch (error) {
            console.error(`Update cart item ${cartProductId} quantity failed:`, error.message || error);
            throw error;
        }
    },


    // POST cart/internal/users - Marked as internal, likely not for direct client use but listed in API spec
    _internalCreateCartForUser: async (cartCreateRequest) => { // { userId, id (cartId) }
        try {
            const response = await api.post('/cart/internal/users', cartCreateRequest);
            return response; // ApiResponse<CartResponse>
        } catch (error) {
            console.error('Internal create cart for user failed:', error.message || error);
            throw error;
        }
    }
};
export default cartService;