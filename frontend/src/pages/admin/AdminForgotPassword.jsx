import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'

const STEPS = { EMAIL: 'email', CODE: 'code', RESET: 'reset', DONE: 'done' }

export default function AdminForgotPassword() {
    const navigate = useNavigate()
    const [step, setStep] = useState(STEPS.EMAIL)
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSendCode = async (e) => {
        e.preventDefault()
        setError('')
        if (!email) { setError('Please enter your admin email.'); return }
        setLoading(true)
        try {
            await api.post('/auth/forgot-password', { email })
            setSuccess('Verification code sent to your email!')
            setStep(STEPS.CODE)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send code.')
        }
        setLoading(false)
    }

    const handleVerifyCode = async (e) => {
        e.preventDefault()
        setError('')
        if (!code) { setError('Enter the verification code.'); return }
        setLoading(true)
        try {
            await api.post('/auth/verify-reset-code', { email, code })
            setSuccess('Code verified! Set your new password.')
            setStep(STEPS.RESET)
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid or expired code.')
        }
        setLoading(false)
    }

    const handleResetPassword = async (e) => {
        e.preventDefault()
        setError('')
        if (!newPassword || !confirmPassword) { setError('Fill in both password fields.'); return }
        if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return }
        if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return }

        setLoading(true)
        try {
            await api.post('/auth/reset-password', { email, code, newPassword })
            setStep(STEPS.DONE)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password.')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-brown-800 px-4">
            <div className="w-full max-w-md animate-fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-brown-400 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-warm-lg">
                        🔐
                    </div>
                    <h1 className="font-display text-3xl font-bold text-white">
                        {step === STEPS.DONE ? 'Password Reset!' : 'Admin Password Reset'}
                    </h1>
                    <p className="text-brown-300 mt-1">
                        {step === STEPS.EMAIL && 'Enter your admin email to receive a code'}
                        {step === STEPS.CODE && 'Enter the 6-digit verification code'}
                        {step === STEPS.RESET && 'Create your new admin password'}
                        {step === STEPS.DONE && 'You can now sign into the admin portal'}
                    </p>
                </div>

                {/* Progress Dots */}
                {step !== STEPS.DONE && (
                    <div className="flex items-center justify-center gap-2 mb-6">
                        {[STEPS.EMAIL, STEPS.CODE, STEPS.RESET].map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                                    ${step === s ? 'bg-amber-400 text-brown-800 shadow-warm scale-110'
                                        : Object.values(STEPS).indexOf(step) > i ? 'bg-green-400 text-white'
                                            : 'bg-brown-600 text-brown-400'}`}>
                                    {Object.values(STEPS).indexOf(step) > i ? '✓' : i + 1}
                                </div>
                                {i < 2 && (
                                    <div className={`w-8 h-0.5 ${Object.values(STEPS).indexOf(step) > i ? 'bg-green-400' : 'bg-brown-600'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-white rounded-3xl p-8 shadow-warm-lg">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 mb-4">
                            <span>🔒</span> {error}
                        </div>
                    )}
                    {success && step !== STEPS.EMAIL && (
                        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 mb-4">
                            <span>✓</span> {success}
                        </div>
                    )}

                    {step === STEPS.EMAIL && (
                        <form onSubmit={handleSendCode} className="space-y-4">
                            <div>
                                <label htmlFor="admin-reset-email" className="block text-sm font-medium text-brown-700 mb-1.5">Admin Email</label>
                                <input id="admin-reset-email" type="email" required value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="input" placeholder="admin@sweethaven.in" autoComplete="email" />
                            </div>
                            <button type="submit" disabled={loading}
                                className="btn-primary w-full disabled:opacity-60 flex items-center justify-center gap-2">
                                {loading ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                                ) : '📧 Send Verification Code'}
                            </button>
                        </form>
                    )}

                    {step === STEPS.CODE && (
                        <form onSubmit={handleVerifyCode} className="space-y-4">
                            <div>
                                <label htmlFor="admin-reset-code" className="block text-sm font-medium text-brown-700 mb-1.5">Verification Code</label>
                                <input id="admin-reset-code" type="text" required maxLength={6}
                                    value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="input text-center text-2xl tracking-[0.5em] font-bold"
                                    placeholder="● ● ● ● ● ●" autoComplete="one-time-code" />
                                <p className="text-xs text-brown-400 mt-1.5">Check your admin email inbox</p>
                            </div>
                            <button type="submit" disabled={loading || code.length < 6}
                                className="btn-primary w-full disabled:opacity-60 flex items-center justify-center gap-2">
                                {loading ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying…</>
                                ) : '✓ Verify Code'}
                            </button>
                            <button type="button" onClick={() => { setStep(STEPS.EMAIL); setError(''); setSuccess('') }}
                                className="w-full text-sm text-brown-400 hover:text-brown-600 transition-colors">
                                ← Change email
                            </button>
                        </form>
                    )}

                    {step === STEPS.RESET && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label htmlFor="admin-new-pwd" className="block text-sm font-medium text-brown-700 mb-1.5">New Password</label>
                                <input id="admin-new-pwd" type="password" required autoComplete="new-password"
                                    value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                    className="input" placeholder="At least 6 characters" />
                            </div>
                            <div>
                                <label htmlFor="admin-confirm-pwd" className="block text-sm font-medium text-brown-700 mb-1.5">Confirm Password</label>
                                <input id="admin-confirm-pwd" type="password" required autoComplete="new-password"
                                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                    className="input" placeholder="Re-enter your password" />
                            </div>
                            <button type="submit" disabled={loading}
                                className="btn-primary w-full disabled:opacity-60 flex items-center justify-center gap-2">
                                {loading ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Resetting…</>
                                ) : '🔒 Reset Password'}
                            </button>
                        </form>
                    )}

                    {step === STEPS.DONE && (
                        <div className="text-center py-4">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                                ✅
                            </div>
                            <h3 className="font-display text-xl font-bold text-brown-800 mb-2">Password Updated!</h3>
                            <p className="text-brown-500 mb-6">Your admin password has been changed. Sign in with your new credentials.</p>
                            <button onClick={() => navigate('/admin/login')}
                                className="btn-primary w-full">
                                Sign In to Admin →
                            </button>
                        </div>
                    )}

                    {step !== STEPS.DONE && (
                        <div className="mt-4 text-center">
                            <Link to="/admin/login" className="text-sm text-brown-400 hover:text-brown-600 transition-colors">
                                ← Back to Admin Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
