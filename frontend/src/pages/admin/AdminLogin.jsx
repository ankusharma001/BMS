import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminLogin() {
    const { login, logout, isLoggedIn, isAdmin } = useAuth()
    const navigate = useNavigate()

    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // If already logged in as admin, go to dashboard
    useEffect(() => {
        if (isLoggedIn && isAdmin) {
            navigate('/admin/dashboard', { replace: true })
        }
    }, [isLoggedIn, isAdmin, navigate])

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')

        if (!form.email || !form.password) {
            setError('Please enter your email and password.')
            return
        }

        setLoading(true)
        try {
            // If user is already logged in with non-admin account, log them out first
            if (isLoggedIn && !isAdmin) {
                await logout()
            }

            const user = await login(form.email, form.password)

            if (user.role !== 'admin') {
                // Not an admin — clean up immediately
                await logout()
                setError('Access denied. This portal is for administrators only.')
                return
            }

            navigate('/admin/dashboard', { replace: true })
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-brown-800 px-4">
            <div className="w-full max-w-md animate-fade-in">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-brown-400 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-warm-lg">
                        🧁
                    </div>
                    <h1 className="font-display text-3xl font-bold text-white">Admin Portal</h1>
                    <p className="text-brown-300 mt-1">Sweet Haven Management</p>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-warm-lg">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                <span>🔒</span> {error}
                            </div>
                        )}
                        <div>
                            <label htmlFor="admin-email" className="block text-sm font-medium text-brown-700 mb-1.5">Admin Email</label>
                            <input id="admin-email" name="email" type="email" required value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                className="input" placeholder="admin@sweethaven.in" autoComplete="email" />
                        </div>
                        <div>
                            <label htmlFor="admin-password" className="block text-sm font-medium text-brown-700 mb-1.5">Password</label>
                            <input id="admin-password" name="password" type="password" required value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                className="input" placeholder="••••••••" autoComplete="current-password" />
                        </div>
                        <button type="submit" disabled={loading}
                            className="btn-primary w-full mt-2 disabled:opacity-60 flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in…
                                </>
                            ) : 'Sign In to Admin'}
                        </button>
                    </form>
                    <div className="mt-4 flex items-center justify-between">
                        <Link to="/admin/forgot-password" className="text-sm text-brown-400 hover:text-brown-600 transition-colors">
                            Forgot password?
                        </Link>
                        <Link to="/" className="text-sm text-brown-400 hover:text-brown-600 transition-colors">
                            ← Back to Store
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
