import React from 'react';
import { Card } from '../components/Card';
import { ShaderBackground } from '../components/ShaderBackground';
import { Shield, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="relative min-h-screen pt-24 pb-16 bg-background text-white">
      <ShaderBackground type="core" />

      <main className="relative z-10 max-w-4xl mx-auto px-margin-desktop space-y-8">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
            <Shield className="w-3.5 h-3.5" /> Privacy & Data Sovereignty
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Game World Privacy Policy</h1>
          <p className="text-xs text-on-surface-variant">Last updated: October 2026 • Strict GDPR & CCPA Compliance Protocol</p>
        </div>

        <Card level={2} className="p-8 border border-white/5 space-y-8 leading-relaxed text-xs text-white/80">
          
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" /> 1. Principles of Data Protection
            </h2>
            <p>
              Game World operates under a strict principle of <strong>Zero-Trust Data Minimization</strong>. We do not sell, rent, or monetize your personal information to third-party advertisers. All telemetry collected is dedicated exclusively to match latency optimization, anti-cheat validation, and account security.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-secondary" /> 2. Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-on-surface-variant">
              <li><strong>Account Credentials:</strong> Username, email address, salted password hashes (Argon2id/SHA-256). We never store plaintext passwords.</li>
              <li><strong>Gameplay & Match Telemetry:</strong> High scores, game durations, ELO ratings, and anti-cheat validation nonces.</li>
              <li><strong>Station Information:</strong> Approximate geographic region (e.g. EU, US-East) and device station identifiers for multi-session threat protection.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> 3. Cookie & Session Security
            </h2>
            <p>
              Game World utilizes strictly necessary session tokens. In production deployments, authentication cookies are configured with:
            </p>
            <div className="p-3 bg-black/50 border border-white/5 rounded-xl font-mono text-[11px] text-emerald-400 space-y-1">
              <div>• HttpOnly = true (Guards against client-side script harvesting)</div>
              <div>• Secure = true (Enforces HTTPS/TLS 1.3 transmission exclusively)</div>
              <div>• SameSite = Strict (Neutralizes CSRF attack vectors)</div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-yellow-400" /> 4. GDPR & CCPA Rights
            </h2>
            <p>
              Regardless of your geographic location, Game World affords every player universal privacy rights:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-on-surface-variant">
              <li><strong>Right of Access (Article 15):</strong> Export your complete personal JSON archive anytime in your <Link to="/profile" className="text-primary underline">Player Profile</Link>.</li>
              <li><strong>Right to be Forgotten (Article 17):</strong> Instant and permanent account erasure with complete ledger dissociation.</li>
              <li><strong>Right to Object:</strong> Toggle optional telemetry dispatches and 2FA authentication modes at your discretion.</li>
            </ul>
          </section>

          <section className="space-y-2 pt-4 border-t border-white/5">
            <p className="text-[11px] text-on-surface-variant">
              For legal inquiries or Data Protection Officer (DPO) dispatches, contact: <span className="text-white font-mono">security@gameworld.gg</span>.
            </p>
          </section>

        </Card>

      </main>
    </div>
  );
};
