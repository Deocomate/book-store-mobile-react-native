import { AuthProvider, useAuth } from './AuthContext';
import { CartProvider, useCart } from './CartContext';
import { NotificationProvider, useNotification } from './NotificationContext';

export {
    AuthProvider, CartProvider, NotificationProvider, useAuth, useCart, useNotification
};

const AppProviders = ({ children }) => (<AuthProvider>
    {children}
</AuthProvider>);

export default AppProviders