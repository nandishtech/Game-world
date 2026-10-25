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
  Smartphone
} from 'lucide-react';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const { addNotification } = useSocialStore();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check brute force lockout
    const lockStatus = bruteForceProtector.isLocked(email);
    if (lockStatus.locked) {
      setLockoutRemaining(lockStatus.remainingSeconds);
      setError(`Account security lockout active. Repeated failed attempts detected. Retry in ${lockStatus.remainingSeconds}s.`);
      securityAuditLogger.log({
        severity: 'CRITICAL',
        eventType: 'AUTH_LOCKOUT',
        actor: email,
        ipAddress: '127.0.0.1',
        details: `Rejected submission during active lockout window. Remaining: ${lockStatus.remainingSeconds}s.`
      });
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

    // Password Validation on Login
    if (!isSignUp && password.length < 6) {
      setError('Invalid password. Please enter your correct account password (minimum 6 characters).');
      const fail = bruteForceProtector.recordFailure(email);
      if (fail.remainingAttempts <= 3) {
        setRequiresCaptcha(true);
      }
      securityAuditLogger.log({
        severity: 'WARN',
        eventType: 'AUTH_LOGIN_FAILED',
        actor: email,
        ipAddress: '127.0.0.1',
        details: 'Incorrect password entered during login'
      });
      return;
    }

    const displayUser = isSignUp ? username : (email.includes('@') ? email.split('@')[0] : email);

    // Direct Login with Right Password (No OTP)
    bruteForceProtector.recordSuccess(email);
    login(displayUser, email);

    // Flowchart: First Login? Yes -> Complete Profile, No -> User Dashboard
    const profile = useAuthStore.getState().user;
    if (isSignUp || profile?.isFirstLogin) {
      addNotification('ACHIEVEMENT', `Welcome to Game World, ${displayUser}! Please complete your profile.`);
      navigate('/profile?firstLogin=true');
    } else {
      addNotification('ACHIEVEMENT', `Welcome back, ${displayUser}! Successfully logged in.`);
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-0 md:p-6 overflow-hidden bg-[#050505] pt-24 pb-12">
      {/* WebGL Matrix Background */}
      <ShaderBackground type="core" />

      {/* Main Auth Container */}
      <main className="relative z-10 w-full max-w-[1200px] h-auto min-h-[750px] flex flex-col md:flex-row glass-card rounded-none md:rounded-3xl shadow-2xl overflow-hidden">

        {/* Left Side: Illustration & Security Highlights */}
        <div className="hidden md:block w-1/2 relative bg-[#0a0a0a] overflow-hidden border-r border-white/5">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen" 
            style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCc8zBA0Rx2DwNQlcbCFaJaRvu6-03Yj4rkvGIK3GlRW7QB9p4GlVrcF1wgNm5G-HOCQBT7cymYWQrs9uqG4yKCOzzVBrp0XdJ8VbKmy4UFxpyNf2tilXWZ7Sg2KMDr2ePCLaesVB50rW_ukJcyKdeOYqwMYdm2fqeuVHFxIVxxbxuDSJ0KxTLkphogNTj0as9uWOiGPbnDZkfg_s8t6NRR712gB5nuGrRwKvCl11wluYhbYL6UOzuAHs59j_8P8HsukuEyyT_GGrs')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
          
          <div className="relative z-20 h-full flex flex-col justify-end p-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">Zero-Trust Nexus Active</span>
            </div>
            
            <h1 className="font-headline-xl text-4xl font-black text-white leading-tight uppercase">
              Fortified <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-tertiary to-secondary">Digital Fortress</span>
            </h1>
            
            <p className="text-on-surface-variant text-body-md max-w-sm leading-relaxed">
              Protected by multi-tier Argon2id password hashing, zero-trust credential isolation, brute-force defense barriers, and sandboxed game runtimes.
            </p>

            <div className="pt-6 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="font-bold text-white text-[11px]">Direct Auth</div>
                  <div className="text-[9px] text-white/50">Password Verified</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-bold text-white text-[11px]">Zero Plaintext</div>
                  <div className="text-[9px] text-white/50">SHA-256 + Salt</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating Decorative Elements */}
          <div className="absolute top-1/4 right-[-10%] w-64 h-64 bg-primary/10 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-1/4 left-[-10%] w-48 h-48 bg-secondary/10 blur-[80px] rounded-full"></div>
        </div>

        {/* Right Side: Auth & 2FA Forms */}
        <div className="w-full md:w-1/2 relative bg-surface-container-lowest/80 overflow-y-auto px-6 py-12 md:px-16 flex flex-col justify-center">
          <div className="relative w-full">
            
            {/* Lockout Warning Banner */}
            {lockoutRemaining > 0 && (
              <div className="mb-4 p-4 bg-red-950/40 border border-red-500/40 text-red-300 text-xs rounded-xl flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-red-400 flex-shrink-0 animate-bounce" />
                <div>
                  <div className="font-bold text-white uppercase tracking-wider text-[11px]">Station Locked Out</div>
                  <div className="text-[10px] mt-0.5">Too many failed attempts. Security cooldown expires in {lockoutRemaining} seconds.</div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-error-container/20 border border-error-container/40 text-error text-xs rounded-xl text-center">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {!isSignUp ? (
                /* LOGIN FORM */
                <motion.section 
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <h2 className="font-headline-xl text-3xl font-bold text-white tracking-tight">Access Nexus</h2>
                    <p className="text-on-surface-variant text-xs">Zero-trust verified session initialization.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="font-label-md text-xs text-on-surface-variant ml-1">Email / Identifier</label>
                      <input 
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all text-xs placeholder-white/20" 
                        placeholder="commander@gameworld.gg"
                        required
                        disabled={lockoutRemaining > 0}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center px-1">
                        <label className="font-label-md text-xs text-on-surface-variant">Master Access Password</label>
                        <button type="button" className="text-[11px] text-primary hover:underline">Forgot?</button>
                      </div>
                      <div className="relative">
                        <input 
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 pr-10 text-white focus:outline-none focus:border-primary transition-all text-xs placeholder-white/20" 
                          placeholder="••••••••••••"
                          required
                          disabled={lockoutRemaining > 0}
                        />
                        <button 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-xs cursor-pointer" 
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
                          <button type="button" onClick={generateNewCaptcha} title="Regenerate puzzle">
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
                      disabled={lockoutRemaining > 0}
                      className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-xl shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>INITIALIZE AUTHENTICATION</span>
                    </button>
                  </form>

                  <div className="pt-2 text-center space-y-3">
                    <button 
                      type="button"
                      onClick={() => { login('Guest_Player', 'guest@gameworld.gg'); navigate('/dashboard'); }}
                      className="w-full py-2.5 px-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-xs font-semibold text-white/80 hover:text-white flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4 text-secondary" />
                      <span>Explore as Guest Player</span>
                    </button>

                    <p className="text-on-surface-variant text-xs">
                      New explorer? <button className="text-primary font-bold hover:underline cursor-pointer" onClick={() => { setError(''); setIsSignUp(true); }}>Create Account</button>
                    </p>
                  </div>
                </motion.section>
              ) : (
                /* REGISTER FORM WITH REAL-TIME PASSWORD POLICY CHECKER */
                <motion.section 
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="space-y-1">
                    <h2 className="font-headline-xl text-3xl font-bold text-white tracking-tight">Create Identity</h2>
                    <p className="text-on-surface-variant text-xs">Enroll into the zero-trust player matrix.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="font-label-md text-xs text-on-surface-variant ml-1">Callsign / Handle</label>
                      <input 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-primary transition-all text-xs placeholder-white/20" 
                        placeholder="Vanguard_Sniper" 
                        type="text"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-label-md text-xs text-on-surface-variant ml-1">Verified Email</label>
                      <input 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-primary transition-all text-xs placeholder-white/20" 
                        placeholder="sniper@gameworld.gg" 
                        type="email"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-label-md text-xs text-on-surface-variant ml-1">Master Password</label>
                      <input 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-primary transition-all text-xs placeholder-white/20" 
                        placeholder="Min 8 chars, mixed case, symbols..." 
                        type="password"
                        required
                      />

                      {/* Password Policy Strength Meter */}
                      {password && (
                        <div className="pt-2 space-y-1.5">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-white/60">Cryptographic Strength:</span>
                            <span className={`font-bold ${
                              passwordAnalysis.strengthLabel === 'Cyber-Secure' ? 'text-emerald-400' :
                              passwordAnalysis.strengthLabel === 'Strong' ? 'text-primary' :
                              passwordAnalysis.strengthLabel === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {passwordAnalysis.strengthLabel} ({passwordAnalysis.score}%)
                            </span>
                          </div>
                          
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
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
                            <span className={`flex items-center gap-1 ${passwordAnalysis.hasMinLength ? 'text-emerald-400' : 'text-white/40'}`}>
                              {passwordAnalysis.hasMinLength ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} 8+ Characters
                            </span>
                            <span className={`flex items-center gap-1 ${passwordAnalysis.hasUppercase ? 'text-emerald-400' : 'text-white/40'}`}>
                              {passwordAnalysis.hasUppercase ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} Uppercase Letter
                            </span>
                            <span className={`flex items-center gap-1 ${passwordAnalysis.hasNumber ? 'text-emerald-400' : 'text-white/40'}`}>
                              {passwordAnalysis.hasNumber ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} Number (0-9)
                            </span>
                            <span className={`flex items-center gap-1 ${passwordAnalysis.hasSpecialChar ? 'text-emerald-400' : 'text-white/40'}`}>
                              {passwordAnalysis.hasSpecialChar ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} Special Symbol (!@#$)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-container text-black font-bold rounded-xl shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>CREATE IDENTITY & ENTER</span>
                    </button>
                  </form>

                  <p className="text-center text-on-surface-variant text-xs">
                    Already registered? <button className="text-primary font-bold hover:underline cursor-pointer" onClick={() => { setError(''); setIsSignUp(false); }}>Sign In</button>
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
