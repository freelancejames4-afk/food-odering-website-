import React, { useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from '../firebase';
import { Mail, Lock, User, X, AlertCircle, Loader2, Eye, EyeOff, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthScreenProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function AuthScreen({ onClose, onSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showConsoleTip, setShowConsoleTip] = useState(true);

  // Parse Firebase auth errors to human-friendly strings
  const getFriendlyErrorMessage = (errCode: string, rawMessage: string) => {
    switch (errCode) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email. Try signing up!';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address.';
      case 'auth/weak-password':
        return 'The password must be at least 6 characters long.';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not enabled. Please enable "Email/Password" in your Firebase console under Authentication > Sign-in method.';
      case 'auth/popup-closed-by-user':
        return 'The Google login popup was closed. Please try again.';
      case 'auth/popup-blocked':
        return 'The Google sign-in popup was blocked by your browser. Please allow popups for this site.';
      default:
        return rawMessage || 'An unexpected error occurred during authentication.';
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Basic Validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (mode === 'signup') {
      if (!displayName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: displayName.trim()
        });
        setSuccessMsg('Account created successfully! Welcome to FreshDelivery.');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }, 1500);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccessMsg('Welcome back! Logging you in...');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      setError(getFriendlyErrorMessage(err.code, err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
      setSuccessMsg('Signed in with Google successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError(getFriendlyErrorMessage(err.code, err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Top Graphic Header */}
      <div className="relative bg-gradient-to-br from-indigo-900/60 to-purple-900/40 p-6 text-center border-b border-zinc-800/80">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
            id="close-auth-btn"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        )}
        <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <span className="material-symbols-outlined text-2xl text-indigo-400">lock</span>
        </div>
        <h2 className="font-display text-xl font-extrabold text-zinc-100 tracking-tight">
          {mode === 'login' ? 'Welcome Back' : 'Join FreshDelivery'}
        </h2>
        <p className="text-zinc-400 text-xs mt-1">
          {mode === 'login' ? 'Log in to place and track your organic meals' : 'Create an account to start ordering delicious organic dishes'}
        </p>
      </div>

      <div className="p-6 space-y-5">
        {/* Alerts */}
        {error && (
          <div className="flex gap-2.5 bg-red-500/10 border border-red-500/20 rounded-2xl p-3.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Authentication Failed</p>
              <p className="opacity-90">{error}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="flex gap-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Success</p>
              <p className="opacity-90">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-zinc-400 text-xs font-semibold pl-1">Full Name</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Alex Carter"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={loading}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-600"
                  id="auth-name-input"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-zinc-400 text-xs font-semibold pl-1">Email Address</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-600"
                id="auth-email-input"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-400 text-xs font-semibold pl-1">Password</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-3 pl-10 pr-10 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-600"
                id="auth-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                id="auth-toggle-password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-zinc-400 text-xs font-semibold pl-1">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-3 pl-10 pr-10 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-600"
                  id="auth-confirm-password-input"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-indigo-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            id="auth-submit-btn"
          >
            {loading ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            ) : (
              <span>{mode === 'login' ? 'Sign In with Email' : 'Register Account'}</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-[1px] bg-zinc-800" />
          <span className="text-zinc-600 text-xs font-bold uppercase tracking-wider">or</span>
          <div className="flex-1 h-[1px] bg-zinc-800" />
        </div>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          type="button"
          className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white py-3 rounded-xl text-sm font-bold shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
          id="google-signin-btn"
        >
          {loading ? (
            <Loader2 className="w-4.5 h-4.5 animate-spin" />
          ) : (
            <>
              {/* Google Premium Vector Logo */}
              <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" width="24" height="24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Toggle Mode */}
        <div className="text-center mt-2">
          <p className="text-zinc-500 text-xs">
            {mode === 'login' ? "Don't have an account yet?" : 'Already have an account?'}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              disabled={loading}
              type="button"
              className="text-indigo-400 hover:text-indigo-300 font-bold ml-1.5 hover:underline focus:outline-none cursor-pointer"
              id="toggle-auth-mode-btn"
            >
              {mode === 'login' ? 'Create Account' : 'Log In'}
            </button>
          </p>
        </div>
      </div>

      {/* Developer Console Tip */}
      {showConsoleTip && (
        <div className="m-4 mt-0 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 text-left">
          <div className="flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Developer integration Note</span>
                <button
                  onClick={() => setShowConsoleTip(false)}
                  className="text-zinc-600 hover:text-zinc-400 text-xs cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Ensure that both <strong>Email/Password</strong> and <strong>Google</strong> sign-in providers are enabled in your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 font-semibold hover:underline">Firebase Console</a> under <strong>Authentication &gt; Sign-in method</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
