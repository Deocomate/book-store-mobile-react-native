// src/contexts/CartContext.js
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cartService, productService } from '../services'; // Import cả cartService và productService
import { useAuth } from './AuthContext'; // Để biết user đã đăng nhập chưa

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null); // cart sẽ là CartResponse từ API, với products đã được populate
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth(); // Lấy user để biết userId (cartId)

  /**
   * Fetch giỏ hàng của người dùng hiện tại và populate thông tin chi tiết sản phẩm.
   * @param {boolean} forceRefresh - Buộc làm mới dữ liệu, bỏ qua cache nếu có.
   */
  const fetchCart = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated || !user || !user.id) {
      // console.log('Not authenticated or user missing, resetting cart.');
      setCart(null); // Nếu chưa đăng nhập hoặc không có user, reset giỏ hàng
      setError(null);
      setIsLoading(false); // Đảm bảo loading state được reset
      return;
    }

    // console.log('Fetching cart for user:', user.id);
    setIsLoading(true);
    setError(null);
    try {
      const cartResponse = await cartService.getMyCart(); // Lấy giỏ hàng từ Cart Service
      console.log('Cart response:', cartResponse);

      // cartResponse là ApiResponse<CartResponse>
      // CartResponse: { id (cartId), userId, cartProducts: CartProduct[] }
      // CartProduct: { id (cartProductId), cartId, productId, quantity, createdAt, updatedAt }

      if (cartResponse && cartResponse.status === 200 && cartResponse.result) {
        const fetchedCart = cartResponse.result;
        const cartProductsRaw = fetchedCart.cartProducts || [];

        if (cartProductsRaw.length === 0) {
          // console.log('Cart is empty.');
          setCart({ ...fetchedCart, cartProducts: [] }); // Set giỏ hàng rỗng nếu không có sản phẩm
          return;
        }

        // Lấy tất cả productId duy nhất từ giỏ hàng để fetch thông tin chi tiết
        const productIds = [...new Set(cartProductsRaw.map(item => item.productId))];

        // Fetch thông tin chi tiết của tất cả các sản phẩm
        // Cần một hàm để fetch nhiều sản phẩm cùng lúc nếu API hỗ trợ, hoặc fetch từng cái.
        // Hiện tại, productService.getProductById chỉ lấy từng sản phẩm.
        // Để tối ưu, có thể dùng Promise.all.
        const productDetailsPromises = productIds.map(id =>
          productService.getProductById(id).then(res => res.result).catch(err => {
            console.error(`Failed to fetch details for product ${id}:`, err);
            return null; // Trả về null nếu có lỗi với 1 sản phẩm
          })
        );

        const productDetails = await Promise.all(productDetailsPromises);
        const productMap = new Map(productDetails.filter(p => p !== null).map(p => [p.id, p]));

        // Kết hợp thông tin chi tiết sản phẩm vào mỗi item trong giỏ hàng
        const populatedCartProducts = cartProductsRaw.map(item => ({
          ...item,
          productDetails: productMap.get(item.productId), // Gán thông tin chi tiết sản phẩm
        }));

        // console.log('Populated cart:', { ...fetchedCart, cartProducts: populatedCartProducts });
        setCart({ ...fetchedCart, cartProducts: populatedCartProducts });

      } else if (cartResponse && cartResponse.status === 404) {
        // Backend trả về 404 nếu giỏ hàng chưa tồn tại hoặc rỗng
        // console.log('Cart not found (empty) for user, initializing empty cart.');
        setCart({ id: user.id, userId: user.id, cartProducts: [] }); // Tạo cart rỗng tạm thời
      } else {
        // console.log('Failed to fetch cart:', cartResponse?.message);
        throw new Error(cartResponse?.message || "Không thể tải giỏ hàng.");
      }
    } catch (err) {
      console.error('Fetch cart error in CartContext:', err);
      setError(err.message || 'Lỗi tải giỏ hàng.');
      setCart(null); // Reset cart nếu có lỗi
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Effect để fetch giỏ hàng khi người dùng đăng nhập hoặc `fetchCart` thay đổi
  useEffect(() => {
    fetchCart();
  }, [fetchCart]); // Chạy khi `fetchCart` (do dependencies của nó thay đổi)

  /**
   * Thêm hoặc cập nhật số lượng sản phẩm trong giỏ hàng.
   * @param {number} productId - ID của sản phẩm.
   * @param {number} quantity - Số lượng sản phẩm (để thêm vào hoặc set cho total mới).
   * @returns {boolean} True nếu thành công, false nếu thất bại.
   */
  const addProductToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated || !user || !user.id) {
      setError("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      return false;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Gọi cartService.addProductToCart. Backend sẽ tự xử lý logic tăng/cập nhật số lượng.
      const response = await cartService.addProductToCart({ productId, quantity });
      if (response && (response.status === 200 || response.status === 201)) {
        // Sau khi thêm/cập nhật thành công, fetch lại giỏ hàng để cập nhật UI
        await fetchCart(true); // Force refresh để lấy dữ liệu mới nhất
        return true;
      } else {
        throw new Error(response?.message || "Không thể thêm sản phẩm vào giỏ hàng.");
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      setError(err.message || 'Lỗi thêm vào giỏ hàng.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cập nhật số lượng của một sản phẩm cụ thể trong giỏ hàng.
   * Logic này sử dụng lại `addProductToCart` vì backend hỗ trợ cập nhật số lượng thông qua cùng endpoint.
   * @param {number} productId - ID của sản phẩm.
   * @param {number} newQuantity - Số lượng mới cho sản phẩm.
   * @returns {boolean} True nếu thành công, false nếu thất bại.
   */
  const updateCartItemQuantity = async (productId, newQuantity) => {
    if (!isAuthenticated || !user || !user.id) {
      setError("Vui lòng đăng nhập để cập nhật giỏ hàng.");
      return false;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Backend Cart Service's `addProductToCart` handles quantity updates.
      // If item exists, it updates; otherwise, it adds.
      const response = await cartService.addProductToCart({ productId, quantity: newQuantity });

      if (response && (response.status === 200 || response.status === 201)) {
        await fetchCart(true); // Force refresh
        return true;
      } else {
        throw new Error(response?.message || "Không thể cập nhật số lượng sản phẩm.");
      }
    } catch (err) {
      console.error('Update cart item quantity error:', err);
      setError(err.message || 'Lỗi cập nhật số lượng giỏ hàng.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xóa một sản phẩm cụ thể khỏi giỏ hàng bằng productId.
   * @param {number} productId - ID của sản phẩm cần xóa.
   * @returns {boolean} True nếu thành công, false nếu thất bại.
   */
  const removeProductFromCartByProductId = async (productId) => {
    if (!isAuthenticated || !cart || !cart.cartProducts) {
      setError("Giỏ hàng không tồn tại hoặc bạn chưa đăng nhập.");
      return false;
    }
    // Tìm `cartProduct.id` từ `productId`
    const itemToRemove = cart.cartProducts.find(item => item.productId === productId);
    if (!itemToRemove) {
      // console.warn(`Product ID ${productId} not found in cart.`);
      setError("Sản phẩm không tồn tại trong giỏ hàng.");
      return false;
    }

    setIsLoading(true);
    setError(null);
    try {
      // API: DELETE /cart/cart-products, body: Array<integer> (cartProductIds)
      const response = await cartService.removeProductsFromCart([itemToRemove.id]);
      if (response && response.status === 200) {
        await fetchCart(true); // Force refresh
        return true;
      } else {
        throw new Error(response?.message || "Không thể xóa sản phẩm khỏi giỏ hàng.");
      }
    } catch (err) {
      console.error('Remove from cart error:', err);
      setError(err.message || 'Lỗi xóa khỏi giỏ hàng.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xóa tất cả các sản phẩm khỏi giỏ hàng của người dùng hiện tại.
   * @returns {boolean} True nếu thành công, false nếu thất bại.
   */
  const clearCart = async () => {
    if (!isAuthenticated || !cart || !cart.cartProducts || cart.cartProducts.length === 0) {
      // Giỏ hàng đã trống, coi như thành công
      // console.log("Cart is already empty, no need to clear.");
      return true;
    }
    const cartProductIds = cart.cartProducts.map(item => item.id); // Lấy tất cả cartProduct.id
    setIsLoading(true);
    setError(null);
    try {
      const response = await cartService.removeProductsFromCart(cartProductIds);
      if (response && response.status === 200) {
        await fetchCart(true); // Sẽ set cart thành rỗng
        return true;
      } else {
        throw new Error(response?.message || "Không thể xóa toàn bộ giỏ hàng.");
      }
    } catch (err) {
      console.error('Clear cart error:', err);
      setError(err.message || 'Lỗi xóa giỏ hàng.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Tính tổng giá trị của các sản phẩm trong giỏ hàng.
   * Sử dụng useMemo để tối ưu hiệu suất.
   * @returns {number} Tổng giá trị.
   */
  const getCartTotal = useMemo(() => {
    if (!cart || !cart.cartProducts) return 0;
    return cart.cartProducts.reduce((total, item) => {
      // Sử dụng `item.productDetails.discount` (giá sau giảm) nếu có, nếu không thì dùng `item.productDetails.price` (giá gốc)
      const price = item.productDetails?.discount || item.productDetails?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  }, [cart]);

  /**
   * Tính tổng số lượng sản phẩm (items) trong giỏ hàng.
   * Sử dụng useMemo để tối ưu hiệu suất.
   * @returns {number} Tổng số lượng.
   */
  const getCartCount = useMemo(() => {
    if (!cart || !cart.cartProducts) return 0;
    return cart.cartProducts.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);


  const value = {
    cart, // CartResponse { id, userId, cartProducts: List<CartProductResponseWithDetails> }
    // CartProductResponseWithDetails: { id, cartId, productId, quantity, ..., productDetails: ProductResponse }
    isLoading,
    error,
    fetchCart, // Có thể dùng để refresh thủ công
    addProductToCart,
    updateCartItemQuantity,
    removeProductFromCartByProductId,
    clearCart,
    getCartTotal,
    getCartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;