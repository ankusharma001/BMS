import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

const STEPS = { EMAIL: 'email', CODE: 'code', RESET: 'reset', DONE: 'done' }

export default function ForgotPassword() {
    const navigate = useNavigate()
    const [step, setStep] = useState(STEPS.EMAIL)
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    // Step 1: Send verification code
    const handleSendCode = async (e) => {
        e.preventDefault()
        setError('')
        if (!email) { setError('Please enter your email address.'); return }

        setLoading(true)
        try {
            await api.post('/auth/forgot-password', { email })
            setSuccess('A verification code has been sent to your email!')
            setStep(STEPS.CODE)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send code. Please try again.')
        }
        setLoading(false)
    }

    // Step 2: Verify code
    const handleVerifyCode = async (e) => {
        e.preventDefault()
        setError('')
        if (!code) { setError('Please enter the verification code.'); return }

        setLoading(true)
        try {
            await api.post('/auth/verify-reset-code', { email, code })
            setSuccess('Code verified! Now set your new password.')
            setStep(STEPS.RESET)
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid or expired code.')
        }
        setLoading(false)
    }

    // Step 3: Reset password
    const handleResetPassword = async (e) => {
        e.preventDefault()
        setError('')

        if (!newPassword || !confirmPassword) { setError('Please fill in both password fields.'); return }
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
        <div className="min-h-screen flex items-center justify-center px-4"
            style={{ background: 'linear-gradient(135deg, #fdf0e0 0%, #fae0d0 100%)' }}>

            <div className="w-full max-w-md animate-fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-warm">
                        🔐
                    </div>
                    <h1 className="font-display text-3xl font-bold text-brown-800">
                        {step === STEPS.DONE ? 'All Set!' : 'Forgot Password'}
                    </h1>
                    <p className="text-brown-400 mt-1">
                        {step === STEPS.EMAIL && 'Enter your email to receive a verification code'}
                        {step === STEPS.CODE && 'Enter the 6-digit code sent to your email'}
                        {step === STEPS.RESET && 'Create your new password'}
                        {step === STEPS.DONE && 'Your password has been reset successfully'}
                    </p>
                </div>

                {/* Progress Steps */}
                {step !== STEPS.DONE && (
                    <div className="flex items-center justify-center gap-2 mb-6">
                        {[STEPS.EMAIL, STEPS.CODE, STEPS.RESET].map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                                    ${step === s ? 'bg-brown-400 text-white shadow-warm scale-110'
                                        : Object.values(STEPS).indexOf(step) > i ? 'bg-green-400 text-white'
                                            : 'bg-cream-200 text-brown-400'}`}>
                                    {Object.values(STEPS).indexOf(step) > i ? '✓' : i + 1}
                                </div>
                                {i < 2 && (
                                    <div className={`w-8 h-0.5 ${Object.values(STEPS).indexOf(step) > i ? 'bg-green-400' : 'bg-cream-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="card shadow-warm-lg">
                    {/* Alerts */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 mb-4">
                            <span>⚠️</span> {error}
                        </div>
                    )}
                    {success && step !== STEPS.EMAIL && (
                        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 mb-4">
                            <span>✓</span> {success}
                        </div>
                    )}

                    {/* Step 1: Email */}
                    {step === STEPS.EMAIL && (
                        <form onSubmit={handleSendCode} className="space-y-4">
                            <div>
                                <label htmlFor="reset-email" className="block text-sm font-medium text-brown-700 mb-1.5">Email Address</label>
                                <input
                                    id="reset-email"
                                    type="email" required autoComplete="email"
                                    value={email} onChange={e => setEmail(e.target.value)}
                                    className="input" placeholder="you@example.com"
                                />
                            </div>
                            <button type="submit" disabled={loading}
                                className="btn-primary w-full disabled:opacity-60 flex items-center justify-center gap-2">
                                {loading ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                                ) : '📧 Send Verification Code'}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Verification Code */}
                    {step === STEPS.CODE && (
                        <form onSubmit={handleVerifyCode} className="space-y-4">
                            <div>
                                <label htmlFor="reset-code" className="block text-sm font-medium text-brown-700 mb-1.5">Verification Code</label>
                                <input
                                    id="reset-code"
                                    type="text" required maxLength={6} autoComplete="one-time-code"
                                    value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="input text-center text-2xl tracking-[0.5em] font-bold"
                                    placeholder="● ● ● ● ● ●"
                                />
                                <p className="text-xs text-brown-400 mt-1.5">Check your email inbox (and spam folder)</p>
                            </div>
                            <button type="submit" disabled={loading || code.length < 6}
                                className="btn-primary w-full disabled:opacity-60 flex items-center justify-center gap-2">
                                {loading ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying…</>
                                ) : '✓ Verify Code'}
                            </button>
                            <button type="button" onClick={() => { setStep(STEPS.EMAIL); setError(''); setSuccess('') }}
                                className="w-full text-sm text-brown-400 hover:text-brown-600 transition-colors">
                                ← Back to email
                            </button>
                        </form>
                    )}

                    {/* Step 3: New Password */}
                    {step === STEPS.RESET && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label htmlFor="new-password" className="block text-sm font-medium text-brown-700 mb-1.5">New Password</label>
                                <input
                                    id="new-password"
                                    type="password" required autoComplete="new-password"
                                    value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                    className="input" placeholder="At least 6 characters"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-brown-700 mb-1.5">Confirm Password</label>
                                <input
                                    id="confirm-password"
                                    type="password" required autoComplete="new-password"
                                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                    className="input" placeholder="Re-enter your password"
                                />
                            </div>
                            <button type="submit" disabled={loading}
                                className="btn-primary w-full disabled:opacity-60 flex items-center justify-center gap-2">
                                {loading ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Resetting…</>
                                ) : '🔒 Reset Password'}
                            </button>
                        </form>
                    )}

                    {/* Step 4: Success */}
                    {step === STEPS.DONE && (
                        <div className="text-center py-4">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                                🎉
                            </div>
                            <h3 className="font-display text-xl font-bold text-brown-800 mb-2">Password Reset!</h3>
                            <p className="text-brown-500 mb-6">Your password has been changed successfully. You can now sign in with your new password.</p>
                            <button onClick={() => navigate('/login')}
                                className="btn-primary w-full">
                                Sign In Now →
                            </button>
                        </div>
                    )}

                    {/* Footer link */}
                    {step !== STEPS.DONE && (
                        <div className="mt-5 text-center">
                            <p className="text-sm text-brown-500">
                                Remember your password?{' '}
                                <Link to="/login" className="text-brown-600 font-semibold hover:underline">Sign in</Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
