import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Pages
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import MyOrders from './pages/MyOrders'
import About from './pages/About'
import Contact from './pages/Contact'
import UserDashboard from './pages/UserDashboard'

// Admin
import AdminLogin from './pages/admin/AdminLogin'
import AdminForgotPassword from './pages/admin/AdminForgotPassword'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminReports from './pages/admin/AdminReports'
import AdminReviews from './pages/admin/AdminReviews'

// Guards
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'

const AdminLayout = ({ children }) => <>{children}</>

export default function App() {
    return (
        <div className="min-h-screen flex flex-col">
            <Routes>
                {/* Admin routes — no public navbar/footer */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
                <Route path="/admin/*" element={
                    <AdminRoute>
                        <Routes>
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="products" element={<AdminProducts />} />
                            <Route path="orders" element={<AdminOrders />} />
                            <Route path="reports" element={<AdminReports />} />
                            <Route path="reviews" element={<AdminReviews />} />
                        </Routes>
                    </AdminRoute>
                } />

                {/* Public / customer routes */}
                <Route path="/*" element={
                    <>
                        <Navbar />
                        <main className="flex-1">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/products" element={<Products />} />
                                <Route path="/products/:id" element={<ProductDetail />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                                <Route path="/order-success/:id" element={<PrivateRoute><OrderSuccess /></PrivateRoute>} />
                                <Route path="/my-orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
                                <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
                            </Routes>
                        </main>
                        <Footer />
                    </>
                } />
            </Routes>
        </div>
    )
}
