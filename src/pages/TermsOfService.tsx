import React from 'react';
import { Card } from '../components/Card';
import { ShaderBackground } from '../components/ShaderBackground';
import { ShieldAlert, Scale, Ban, Award, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsOfService: React.FC = () => {
  return (
    <div className="relative min-h-screen pt-24 pb-16 bg-background text-white">
      <ShaderBackground type="core" />

      <main className="relative z-10 max-w-4xl mx-auto px-margin-desktop space-y-8">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
            <Scale className="w-3.5 h-3.5" /> Fair Play & Platform Charter
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Terms of Service & Code of Conduct</h1>
          <p className="text-xs text-on-surface-variant">Effective: October 2026 • Governing Competitive Fair Play & Account Integrity</p>
        </div>

        <Card level={2} className="p-8 border border-white/5 space-y-8 leading-relaxed text-xs text-white/80">
          
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" /> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing the Game World Cyber-Nexus, registering an account, or playing web and desktop games across our catalog, you agree to comply with this Charter and all applicable local and international cybersecurity laws.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Ban className="w-4 h-4 text-red-400" /> 2. Anti-Cheat & Fair Play Prohibitions
            </h2>
            <p>Game World operates automated and heuristic anti-cheat surveillance. You strictly agree not to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-on-surface-variant">
              <li>Inject automated scripts, macros, memory editors, or bots into iframe game runtimes.</li>
              <li>Forge score submission nonces, manipulate postMessage payloads, or execute replay attacks.</li>
              <li>Exploit leaderboard vulnerabilities, coin generation bugs, or network delay manipulation.</li>
              <li>Disrupt platform infrastructure via DDoS, unauthorized scraping, or brute-force credential stuffing.</li>
            </ul>
            <p className="text-red-400 font-semibold pt-1">
              Violations result in immediate account suspension, ELO stripping, and permanent cryptographic blacklisting.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400" /> 3. Virtual Coins & BattlePass Assets
            </h2>
            <p>
              Game World coins, battlepass ribbons, and cosmetic items are virtual gameplay enhancements with no real-world monetary redemption value. Transactions are cryptographically committed to our tamper-evident ledger and cannot be transferred outside the platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" /> 4. Sandbox Isolation & Game Content
            </h2>
            <p>
              All community-curated and open-source games execute in secure browser sandboxes (<code className="text-primary font-mono text-[11px]">sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"</code>). Content creators retain intellectual rights to their titles while granting Game World non-exclusive hosting distribution privileges.
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-white/5">
            <p className="text-[11px] text-on-surface-variant">
              For moderation appeals or code of conduct reports, visit the <Link to="/moderation" className="text-primary underline">Trust Center</Link> or dispatch to <span className="text-white font-mono">legal@gameworld.gg</span>.
            </p>
          </section>

        </Card>

      </main>
    </div>
  );
};
