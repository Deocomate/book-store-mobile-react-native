// src/services/cartService.js
import api from './api';

const cartService = {
    /**
     * Thêm sản phẩm vào giỏ hàng hoặc cập nhật số lượng nếu sản phẩm đã tồn tại.
     * Backend sẽ tự động xử lý logic này.
     * @param {object} cartProductData - Dữ liệu sản phẩm trong giỏ hàng.
     *   `cartProductData` phải chứa:
     *   - `productId` (number): ID của sản phẩm.
     *   - `quantity` (number): Số lượng sản phẩm muốn thêm/cập nhật.
     * @returns {Promise<object>} ApiResponse<CartProductResponse> hoặc ApiResponse<string> nếu có lỗi.
     */
    addProductToCart: async (cartProductData) => { // { productId, quantity }
        try {
            const response = await api.post('/cart/cart-products', cartProductData);
            return response; // ApiResponse<CartProductResponse> (hoặc ApiResponse<string> tùy thuộc vào response của backend)
        } catch (error) {
            console.error('Add product to cart failed:', error.message || error);
            throw error;
        }
    },

    /**
     * Xóa một hoặc nhiều sản phẩm khỏi giỏ hàng.
     * @param {number[]} cartProductIds - Mảng các ID của CartProduct cần xóa.
     * @returns {Promise<object>} ApiResponse<string> (thường là message thành công)
     */
    removeProductsFromCart: async (cartProductIds) => { // Array<integer> of cart_product_ids
        try {
            // Đối với phương thức DELETE với body, Axios sử dụng `data` key trong config.
            const response = await api.delete('/cart/cart-products', { data: cartProductIds });
            return response; // ApiResponse<string>
        } catch (error) {
            console.error('Remove products from cart failed:', error.message || error);
            throw error;
        }
    },

    /**
     * Lấy thông tin giỏ hàng của người dùng hiện tại.
     * @returns {Promise<object>} ApiResponse<CartResponse>
     *   CartResponse: { id (cartId), userId, cartProducts: CartProduct[] }
     *   CartProduct: { id (cartProductId), cartId, productId, quantity, createdAt, updatedAt }
     *   (Lưu ý: CartProduct không có thông tin chi tiết của sản phẩm như tên, giá. Sẽ cần fetch từ productService).
     */
    getMyCart: async () => {
        try {
            // Dựa vào axios_response_example.txt, endpoint này tồn tại và trả về CartResponse.
            // Backend CartService sẽ tự động xác định user từ token JWT.
            const response = await api.get('/cart/');
            return response; // ApiResponse<CartResponse>
        } catch (error) {
            console.error('Get my cart failed:', error.message || error);
            // Quan trọng: Trả về một cấu trúc lỗi hoặc giỏ hàng rỗng để context có thể xử lý.
            // Nếu đây là lỗi 404 (giỏ hàng không tồn tại), có thể trả về một giỏ rỗng mặc định.
            if (error.status === 404) { // Giả sử backend trả về 404 nếu không tìm thấy giỏ
                return { status: 404, message: "Giỏ hàng của bạn đang trống.", result: { cartProducts: [] } };
            }
            throw error; // Ném các lỗi khác để xử lý chung
        }
    },

    // ----------------------------------------------------------------------
    // Các endpoints internal hoặc không cần dùng trực tiếp từ ứng dụng di động:
    // ----------------------------------------------------------------------

    /**
     * Endpoint nội bộ để tạo giỏ hàng cho người dùng.
     * Thường được gọi bởi Identity Service khi người dùng mới đăng ký.
     * Không nên gọi trực tiếp từ ứng dụng di động.
     * @param {object} cartCreateRequest - { userId, id (cartId) }
     * @returns {Promise<object>} ApiResponse<CartResponse>
     */
    _internalCreateCartForUser: async (cartCreateRequest) => {
        try {
            const response = await api.post('/cart/internal/users', cartCreateRequest);
            return response;
        } catch (error) {
            console.error('Internal create cart for user failed:', error.message || error);
            throw error;
        }
    }
};
export default cartService;