import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
    { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/admin/products', icon: '🍫', label: 'Products' },
    { to: '/admin/orders', icon: '📦', label: 'Orders' },
    { to: '/admin/reviews', icon: '⭐', label: 'Reviews' },
    { to: '/admin/reports', icon: '📈', label: 'Reports' },
]

export default function AdminSidebar() {
    const location = useLocation()
    const { logout, user } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/admin/login')
    }

    return (
        <aside className="w-64 min-h-screen bg-brown-800 text-white flex flex-col shrink-0">
            {/* Logo */}
            <div className="px-6 py-6 border-b border-brown-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brown-400 rounded-xl flex items-center justify-center text-xl">🧁</div>
                    <div>
                        <p className="font-display font-bold text-lg text-white leading-none">Sweet Haven</p>
                        <p className="text-brown-300 text-xs mt-0.5">Admin Panel</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV.map(item => {
                    const active = location.pathname === item.to
                    return (
                        <Link key={item.to} to={item.to}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${active
                                    ? 'bg-brown-500 text-white shadow-warm'
                                    : 'text-brown-200 hover:bg-brown-700 hover:text-white'}`}>
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* User info + logout */}
            <div className="px-4 py-4 border-t border-brown-700">
                <div className="flex items-center gap-3 mb-3 px-2">
                    <div className="w-8 h-8 bg-brown-400 rounded-full flex items-center justify-center text-sm font-bold">
                        {user?.full_name?.charAt(0) || 'A'}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user?.full_name || 'Admin'}</p>
                        <p className="text-xs text-brown-300 truncate">{user?.email}</p>
                    </div>
                </div>
                <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-brown-300 hover:bg-red-900/40 hover:text-red-300 transition-colors">
                    <span>🚪</span> Sign Out
                </button>
            </div>
        </aside>
    )
}
