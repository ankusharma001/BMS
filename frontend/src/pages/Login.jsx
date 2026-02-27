import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const { login, isLoggedIn, isAdmin } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Where to go after login (support ?redirect=xxx)
    const from = location.state?.from || new URLSearchParams(location.search).get('redirect') || '/'

    // If already logged in, redirect immediately
    useEffect(() => {
        if (isLoggedIn) {
            navigate(isAdmin ? '/admin/dashboard' : from, { replace: true })
        }
    }, [isLoggedIn, isAdmin, navigate, from])

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')

        if (!form.email || !form.password) {
            setError('Please enter your email and password.')
            return
        }

        setLoading(true)
        try {
            const user = await login(form.email, form.password)

            // Redirect based on role
            if (user.role === 'admin') {
                navigate('/admin/dashboard', { replace: true })
            } else {
                navigate(from, { replace: true })
            }
        } catch (err) {
            const msg = err.response?.data?.error || 'Login failed. Check your credentials.'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4"
            style={{ background: 'linear-gradient(135deg, #fdf0e0 0%, #fae0d0 100%)' }}>

            <div className="w-full max-w-md animate-fade-in">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-brown-300 to-brown-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-warm">
                        🧁
                    </div>
                    <h1 className="font-display text-3xl font-bold text-brown-800">Welcome back!</h1>
                    <p className="text-brown-400 mt-1">Sign in to your Sweet Haven account</p>
                </div>

                <div className="card shadow-warm-lg">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="login-email" className="block text-sm font-medium text-brown-700 mb-1.5">Email</label>
                            <input
                                id="login-email"
                                name="email" type="email" required autoComplete="email"
                                value={form.email} onChange={handleChange}
                                className="input" placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="login-password" className="block text-sm font-medium text-brown-700 mb-1.5">Password</label>
                            <input
                                id="login-password"
                                name="password" type="password" required autoComplete="current-password"
                                value={form.password} onChange={handleChange}
                                className="input" placeholder="••••••••"
                            />
                        </div>

                        <div className="text-right">
                            <Link to="/forgot-password" className="text-sm text-brown-500 hover:text-brown-700 hover:underline transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <button type="submit" disabled={loading}
                            className="btn-primary w-full mt-2 disabled:opacity-60 flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in…
                                </>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-5 text-center">
                        <p className="text-sm text-brown-500">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-brown-600 font-semibold hover:underline">Sign up free</Link>
                        </p>
                    </div>
                </div>

                <p className="text-center mt-6 text-xs text-brown-400">
                    Admin?{' '}
                    <Link to="/admin/login" className="text-brown-500 hover:underline">Admin login →</Link>
                </p>
            </div>
        </div>
    )
}
