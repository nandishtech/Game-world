import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useSocialStore } from '../store/useSocialStore';
import { ShaderBackground } from '../components/ShaderBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  validatePasswordPolicy, 
  bruteForceProtector, 
  securityAuditLogger
} from '../services/securityService';
import { 
  ShieldCheck, 
  ShieldAlert, 
  KeyRound, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Lock, 
  Smartphone,
  Loader2
} from 'lucide-react';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginWithCredentials = useAuthStore((state) => state.loginWithCredentials);
  const registerWithCredentials = useAuthStore((state) => state.registerWithCredentials);
  const loginGuest = useAuthStore((state) => state.login);
  const { addNotification } = useSocialStore();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // CAPTCHA State for Bot Protection
  const [requiresCaptcha, setRequiresCaptcha] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaProblem, setCaptchaProblem] = useState({ q: '7 + 8', a: '15' });

  // Form Fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Real-time Password Policy Analysis
  const passwordAnalysis = validatePasswordPolicy(password);

  useEffect(() => {
    if (location.state && typeof (location.state as any).isSignUp === 'boolean') {
      setIsSignUp((location.state as any).isSignUp);
    }
  }, [location.state]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  const generateNewCaptcha = () => {
    const n1 = Math.floor(Math.random() * 9) + 2;
    const n2 = Math.floor(Math.random() * 9) + 2;
    setCaptchaProblem({ q: `${n1} + ${n2}`, a: String(n1 + n2) });
    setCaptchaAnswer('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check brute force lockout
    const lockStatus = bruteForceProtector.isLocked(email);
    if (lockStatus.locked || lockoutRemaining > 0) {
      setError(`Account security lockout active. Retry in ${lockoutRemaining || lockStatus.remainingSeconds}s.`);
      return;
    }

    // CAPTCHA Verification if required
    if (requiresCaptcha && captchaAnswer.trim() !== captchaProblem.a) {
      setError('Bot verification failed. Please solve the security puzzle correctly.');
      generateNewCaptcha();
      return;
    }

    if (!email || !password || (isSignUp && !username)) {
      setError('Please fill in all required credentials.');
      return;
    }

    // Password Policy Check on Registration
    if (isSignUp && !passwordAnalysis.isValid) {
      setError('Password does not satisfy Game World security policy (must be 8+ chars with uppercase, lowercase, number, and symbol).');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Real account registration with cryptographic password hashing
        const newUser = await registerWithCredentials(username.trim(), email.trim(), password);
        addNotification('ACHIEVEMENT', `Welcome to Game World, ${newUser.displayName || newUser.username}! Profile created.`);
        
        const destination = (location.state as any)?.from?.pathname;
        navigate(destination || '/profile?firstLogin=true', { replace: true });
      } else {
        // Real password verification
        const user = await loginWithCredentials(email.trim(), password);
        bruteForceProtector.recordSuccess(email);
        addNotification('ACHIEVEMENT', `Welcome back, ${user.displayName || user.username}! Successfully authenticated.`);
        
        const destination = (location.state as any)?.from?.pathname;
        navigate(destination || '/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
      if (err.locked && err.remainingSeconds) {
        setLockoutRemaining(err.remainingSeconds);
      }
      if (err.captchaRequired || (err.remainingAttempts !== undefined && err.remainingAttempts <= 2)) {
        setRequiresCaptcha(true);
        generateNewCaptcha();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestExplore = () => {
    loginGuest('Guest_Player', 'guest@gameworld.gg');
    const destination = (location.state as any)?.from?.pathname;
    navigate(destination || '/dashboard', { replace: true });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-3 sm:p-6 overflow-hidden bg-[#050505] pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* WebGL Matrix Background */}
      <ShaderBackground type="core" />

      {/* Main Auth Container - Fluid and responsive on mobile and desktop */}
      <main className="relative z-10 w-full max-w-[1100px] h-auto min-h-0 md:min-h-[640px] flex flex-col md:flex-row glass-card rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden my-auto">

        {/* Left Side: Cyber Illustration & Security Badges (Hidden on small mobile) */}
        <div className="hidden md:block w-1/2 relative bg-[#0a0a0a] overflow-hidden border-r border-white/5">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen" 
            style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCc8zBA0Rx2DwNQlcbCFaJaRvu6-03Yj4rkvGIK3GlRW7QB9p4GlVrcF1wgNm5G-HOCQBT7cymYWQrs9uqG4yKCOzzVBrp0XdJ8VbKmy4UFxpyNf2tilXWZ7Sg2KMDr2ePCLaesVB50rW_ukJcyKdeOYqwMYdm2fqeuVHFxIVxxbxuDSJ0KxTLkphogNTj0as9uWOiGPbnDZkfg_s8t6NRR712gB5nuGrRwKvCl11wluYhbYL6UOzuAHs59j_8P8HsukuEyyT_GGrs')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
          
          <div className="relative z-20 h-full flex flex-col justify-end p-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">Zero-Trust Nexus Active</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-wider leading-tight">
              GAME WORLD
              <span className="block text-primary text-xl font-mono mt-1 font-normal">Next-Gen Arcade Station</span>
            </h1>
            <p className="text-xs text-white/70 max-w-sm leading-relaxed">
              Cryptographically verified player sessions, real-time rank scaling, instant multiplayer and 55 master arcade titles.
            </p>

            <div className="pt-2 flex items-center gap-3 text-[10px] text-white/50 border-t border-white/10">
              <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-primary" /> PBKDF2 SHA-512</span>
              <span>•</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Constant-Time Auth</span>
              <span>•</span>
              <span>100% Unblocked</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 md:p-12 flex flex-col justify-center bg-black/60 backdrop-blur-xl">
          <div className="max-w-md w-full mx-auto space-y-6">

            {/* Mobile Header Brand */}
            <div className="md:hidden text-center space-y-1 mb-2">
              <span className="text-[10px] font-black tracking-widest uppercase text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                Game World Nexus
              </span>
              <h2 className="text-2xl font-black text-white tracking-wider">
                {isSignUp ? 'CREATE ACCOUNT' : 'LOGIN ACCESS'}
              </h2>
            </div>

            {/* Lockout Warning Banner */}
            {lockoutRemaining > 0 && (
              <div className="p-3.5 bg-red-950/40 border border-red-500/40 text-red-300 text-xs rounded-xl flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 animate-bounce" />
                <div>
                  <div className="font-bold text-white uppercase tracking-wider text-[11px]">Station Locked Out</div>
                  <div className="text-[10px] mt-0.5">Too many failed attempts. Security cooldown expires in {lockoutRemaining}s.</div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl text-center flex items-center justify-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {!isSignUp ? (
                /* LOGIN FORM */
                <motion.section 
                  key="login"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className="hidden md:block space-y-1">
                    <h2 className="font-headline-xl text-3xl font-bold text-white tracking-tight">Access Nexus</h2>
                    <p className="text-on-surface-variant text-xs">Verify credentials and enter your player command deck.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="font-label-md text-xs text-on-surface-variant ml-1 font-semibold">Email or Username</label>
                      <input 
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all text-xs placeholder-white/20 touch-manipulation" 
                        placeholder="commander or commander@gameworld.io"
                        required
                        disabled={lockoutRemaining > 0 || loading}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center px-1">
                        <label className="font-label-md text-xs text-on-surface-variant font-semibold">Password</label>
                      </div>
                      <div className="relative">
                        <input 
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 pr-12 text-white focus:outline-none focus:border-primary transition-all text-xs placeholder-white/20 touch-manipulation" 
                          placeholder="••••••••••••"
                          required
                          disabled={lockoutRemaining > 0 || loading}
                        />
                        <button 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-xs cursor-pointer px-2 py-1" 
                          type="button"
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    {/* Bot Protection Challenge if activated */}
                    {requiresCaptcha && (
                      <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs text-primary font-bold">
                          <span>Bot Challenge: What is {captchaProblem.q}?</span>
                          <button type="button" onClick={generateNewCaptcha} title="Regenerate puzzle" className="cursor-pointer">
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={captchaAnswer}
                          onChange={(e) => setCaptchaAnswer(e.target.value)}
                          placeholder="Enter answer"
                          className="w-full bg-black/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-white"
                          required
                        />
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={lockoutRemaining > 0 || loading}
                      className="w-full py-3.5 bg-gradient-to-r from-primary to-cyan-400 text-black font-extrabold rounded-xl shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider touch-manipulation"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                      ) : (
                        <KeyRound className="w-4 h-4" />
                      )}
                      <span>{loading ? 'VERIFYING CREDENTIALS...' : 'SIGN IN TO GAME WORLD'}</span>
                    </button>
                  </form>

                  <div className="pt-2 text-center space-y-3">
                    <button 
                      type="button"
                      onClick={handleGuestExplore}
                      className="w-full py-2.5 px-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-xs font-semibold text-white/80 hover:text-white flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
                    >
                      <Smartphone className="w-4 h-4 text-secondary" />
                      <span>Explore as Guest Pilot</span>
                    </button>

                    <p className="text-on-surface-variant text-xs">
                      New commander?{' '}
                      <button 
                        type="button"
                        className="text-primary font-bold hover:underline cursor-pointer" 
                        onClick={() => { setError(''); setIsSignUp(true); }}
                      >
                        Create Account
                      </button>
                    </p>
                  </div>
                </motion.section>
              ) : (
                /* REGISTER FORM WITH REAL-TIME PASSWORD POLICY CHECKER */
                <motion.section 
                  key="register"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="hidden md:block space-y-1">
                    <h2 className="font-headline-xl text-3xl font-bold text-white tracking-tight">Create Account</h2>
                    <p className="text-on-surface-variant text-xs">Register your commander handle and start climbing ranks.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="font-label-md text-xs text-on-surface-variant ml-1 font-semibold">Gamer Callsign / Username</label>
                      <input 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-primary transition-all text-xs placeholder-white/20 touch-manipulation" 
                        placeholder="Apex_Pilot" 
                        type="text"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-label-md text-xs text-on-surface-variant ml-1 font-semibold">Email Address</label>
                      <input 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-primary transition-all text-xs placeholder-white/20 touch-manipulation" 
                        placeholder="pilot@gameworld.io" 
                        type="email"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-label-md text-xs text-on-surface-variant ml-1 font-semibold">Password</label>
                      <input 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-primary transition-all text-xs placeholder-white/20 touch-manipulation" 
                        placeholder="Min 8 chars, Aa, 1-9, symbols" 
                        type="password"
                        required
                        disabled={loading}
                      />

                      {/* Password Policy Strength Meter */}
                      {password && (
                        <div className="pt-2 space-y-1.5">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-white/60">Password Security:</span>
                            <span className={`font-bold ${
                              passwordAnalysis.strengthLabel === 'Cyber-Secure' ? 'text-emerald-400' :
                              passwordAnalysis.strengthLabel === 'Strong' ? 'text-primary' :
                              passwordAnalysis.strengthLabel === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {passwordAnalysis.strengthLabel} ({passwordAnalysis.score}%)
                            </span>
                          </div>
                          
                          <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                passwordAnalysis.score >= 80 ? 'bg-emerald-400' :
                                passwordAnalysis.score >= 60 ? 'bg-primary' :
                                passwordAnalysis.score >= 40 ? 'bg-yellow-400' : 'bg-red-500'
                              }`}
                              style={{ width: `${passwordAnalysis.score}%` }}
                            />
                          </div>

                          {/* Requirement Indicators */}
                          <div className="grid grid-cols-2 gap-1 pt-1 text-[9px]">
                            <span className={`flex items-center gap-1 ${passwordAnalysis.hasMinLength ? 'text-emerald-400 font-bold' : 'text-white/40'}`}>
                              {passwordAnalysis.hasMinLength ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} 8+ Characters
                            </span>
                            <span className={`flex items-center gap-1 ${passwordAnalysis.hasUppercase ? 'text-emerald-400 font-bold' : 'text-white/40'}`}>
                              {passwordAnalysis.hasUppercase ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} Uppercase
                            </span>
                            <span className={`flex items-center gap-1 ${passwordAnalysis.hasNumber ? 'text-emerald-400 font-bold' : 'text-white/40'}`}>
                              {passwordAnalysis.hasNumber ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} Number (0-9)
                            </span>
                            <span className={`flex items-center gap-1 ${passwordAnalysis.hasSpecialChar ? 'text-emerald-400 font-bold' : 'text-white/40'}`}>
                              {passwordAnalysis.hasSpecialChar ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} Symbol (!@#$)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full py-3.5 bg-gradient-to-r from-primary to-cyan-400 text-black font-extrabold rounded-xl shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider touch-manipulation disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                      ) : (
                        <ShieldCheck className="w-4 h-4" />
                      )}
                      <span>{loading ? 'CREATING SECURE ACCOUNT...' : 'REGISTER ACCOUNT'}</span>
                    </button>
                  </form>

                  <p className="text-center text-on-surface-variant text-xs pt-1">
                    Already registered?{' '}
                    <button 
                      type="button"
                      className="text-primary font-bold hover:underline cursor-pointer" 
                      onClick={() => { setError(''); setIsSignUp(false); }}
                    >
                      Sign In
                    </button>
                  </p>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};
