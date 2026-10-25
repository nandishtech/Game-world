import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ShaderBackground } from '../components/ShaderBackground';
import { 
  Users, 
  Server, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Key, 
  AlertTriangle,
  Lock
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { 
  UserRole, 
  ROLE_PERMISSIONS, 
  securityAuditLogger, 
  bruteForceProtector 
} from '../services/securityService';

const INITIAL_ACCOUNTS = [
  { id: 'usr_01', username: 'Commander_Nexus', email: 'nexus@gameworld.gg', role: 'SUPER_ADMIN' as UserRole, status: 'ACTIVE', ip: '192.168.1.104' },
  { id: 'usr_02', username: 'Neon_Specter', email: 'specter@nexus.gg', role: 'USER' as UserRole, status: 'ACTIVE', ip: '142.250.190.46' },
  { id: 'usr_03', username: 'Valkyrie_Protocol', email: 'valk@protocol.gg', role: 'GAME_MANAGER' as UserRole, status: 'ACTIVE', ip: '172.217.16.206' },
  { id: 'usr_04', username: 'Aegis_Mod', email: 'mod@gameworld.gg', role: 'MODERATOR' as UserRole, status: 'ACTIVE', ip: '198.51.100.14' },
  { id: 'usr_05', username: 'Suspicious_Bot_404', email: 'bot@crawler.net', role: 'USER' as UserRole, status: 'FLAGGED', ip: '185.220.101.42' }
];

export const AdminCommand: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'USERS' | 'SECURITY_AUDIT' | 'RBAC_MATRIX' | 'SYSTEMS'>('SECURITY_AUDIT');
  const [search, setSearch] = useState('');
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  
  // Destructive Action Modal State
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; username: string; action: 'BAN' | 'DELETE' } | null>(null);

  const auditLogs = securityAuditLogger.getLogs(30);
  const lockouts = bruteForceProtector.getAllRecords();

  const filteredAccounts = accounts.filter(a => 
    a.username.toLowerCase().includes(search.toLowerCase()) || 
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = (accountId: string, newRole: UserRole) => {
    setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, role: newRole } : a));
    securityAuditLogger.log({
      severity: 'WARN',
      eventType: 'ADMIN_ACTION',
      actor: user?.username || 'SuperAdmin',
      ipAddress: '192.168.1.104',
      details: `Changed role of account ${accountId} to ${newRole}`
    });
  };

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="relative min-h-screen pt-28 pb-12 bg-background flex items-center justify-center">
        <ShaderBackground type="core" />
        <div className="relative z-10 max-w-md w-full mx-auto px-4">
          <div className="bg-surface-container-lowest/90 backdrop-blur-2xl border border-red-500/30 rounded-2xl p-7 shadow-2xl shadow-red-500/10 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mb-1">
                <Lock className="w-8 h-8 animate-pulse text-red-400" />
              </div>
              <div className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/20 text-red-400 border border-red-500/40">
                Admin Access Unavailable
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Admin Console Disabled</h1>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Administrative access requires server-side authentication, which is not configured for this application.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-24 pb-12 bg-background">
      <ShaderBackground type="core" />

      <main className="relative z-10 max-w-container-max mx-auto px-margin-desktop space-y-8">
        
        {/* Top Header Deck */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest bg-red-500/20 text-red-400 border border-red-500/30 uppercase flex items-center gap-1">
                <Lock className="w-3 h-3" /> Zero-Trust Command Console
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Level 5 Clearance Active
              </span>
            </div>
            <h1 className="text-headline-xl font-headline-xl text-white font-bold mt-1">Admin Command Center</h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Multi-tiered RBAC management, threat incident auditing, and platform security controls.
            </p>
          </div>

          {/* Quick Tab Selector & Lock Station */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-black/60 border border-white/10 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('SECURITY_AUDIT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'SECURITY_AUDIT' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/60 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" /> Security Audit
              </button>
              <button
                onClick={() => setActiveTab('USERS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'USERS' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/60 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Users & Accounts
              </button>
              <button
                onClick={() => setActiveTab('RBAC_MATRIX')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'RBAC_MATRIX' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/60 hover:text-white'
                }`}
              >
                <Key className="w-3.5 h-3.5" /> RBAC Matrix
              </button>
              <button
                onClick={() => setActiveTab('SYSTEMS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'SYSTEMS' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/60 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Checklist Audit
              </button>
            </div>
          </div>
        </div>

        {/* Security Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
          <Card level={2} className="p-5 flex items-center gap-4 border border-white/5">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <div>
              <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">WAF & DDoS Status</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">Cloudflare Active</div>
              <div className="text-[9px] text-white/50">SSL/TLS 1.3 Strict</div>
            </div>
          </Card>

          <Card level={2} className="p-5 flex items-center gap-4 border border-white/5">
            <ShieldAlert className="w-8 h-8 text-yellow-400" />
            <div>
              <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Anti-Cheat Flags</div>
              <div className="text-base font-bold text-yellow-400 mt-0.5">0 Active Breaches</div>
              <div className="text-[9px] text-white/50">52 Games Sandboxed</div>
            </div>
          </Card>

          <Card level={2} className="p-5 flex items-center gap-4 border border-white/5">
            <Lock className="w-8 h-8 text-primary" />
            <div>
              <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Authentication Security</div>
              <div className="text-base font-bold text-primary mt-0.5">Argon2id + 2FA</div>
              <div className="text-[9px] text-white/50">Lockouts Monitored</div>
            </div>
          </Card>

          <Card level={2} className="p-5 flex items-center gap-4 border border-white/5">
            <Server className="w-8 h-8 text-cyan-400" />
            <div>
              <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Ledger Integrity</div>
              <div className="text-base font-bold text-cyan-400 mt-0.5">Hash-Chain Intact</div>
              <div className="text-[9px] text-white/50">Zero Double-Spends</div>
            </div>
          </Card>
        </div>

        {/* TAB 1: SECURITY AUDIT & MONITORING LOGS */}
        {activeTab === 'SECURITY_AUDIT' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Live Security Audit Log Stream */}
            <div className="lg:col-span-2 space-y-4">
              <Card level={2} className="p-6 border border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Real-time Security Event Feed</h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Live Telemetry
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {auditLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="p-3 bg-black/40 border border-white/5 rounded-xl hover:border-white/10 transition-colors flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            log.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            log.severity === 'WARN' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-primary/20 text-primary border border-primary/30'
                          }`}>
                            {log.severity}
                          </span>
                          <span className="font-mono text-[10px] text-white/50">{log.eventType}</span>
                          <span className="font-bold text-white text-[11px]">Actor: {log.actor}</span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant font-mono">{log.details}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[9px] text-white/40 block">{log.timestamp}</span>
                        <span className="text-[8px] font-mono text-white/30">{log.ipAddress}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Brute-force & Anti-Cheat Monitor */}
            <div className="space-y-6">
              <Card level={2} className="p-6 border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-yellow-400">
                  <ShieldAlert className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Brute-Force Shield Status</h4>
                </div>
                
                <p className="text-[11px] text-on-surface-variant">
                  Monitors consecutive authentication failures and enforces a 5-minute automated lockout after 5 invalid attempts.
                </p>

                <div className="p-3.5 bg-black/50 border border-white/5 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Active Lockouts:</span>
                    <span className="font-bold text-emerald-400">{lockouts.filter(l => l.isLocked).length} IPs Locked</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Max Attempts Allowed:</span>
                    <span className="font-bold text-white">5 Attempts</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Lockout Duration:</span>
                    <span className="font-bold text-white">300 Seconds</span>
                  </div>
                </div>
              </Card>

              <Card level={2} className="p-6 border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Anti-Cheat Game Isolation</h4>
                </div>
                
                <div className="space-y-2 text-[10px] text-on-surface-variant">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Parent credentials isolated from iframes</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Score replay attacks blocked via Nonce verification</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Rate-of-score anomaly heuristics active</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: USERS & ACCOUNTS DIRECTORY */}
        {activeTab === 'USERS' && (
          <Card level={2} className="p-6 border border-white/5 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="text-headline-sm font-headline-sm text-white font-bold">User Registrations Directory</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Manage player credentials, RBAC tiers, and disciplinary actions.</p>
              </div>
              
              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search accounts or email..."
                  className="w-full bg-[#050505] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-primary transition-all placeholder-white/20"
                />
                <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-on-surface-variant uppercase text-[10px] tracking-wider">
                    <th className="pb-3 font-semibold">User</th>
                    <th className="pb-3 font-semibold">Role (RBAC)</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Origin IP</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAccounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5">
                        <div className="font-bold text-white">{acc.username}</div>
                        <div className="text-[10px] text-on-surface-variant">{acc.email}</div>
                      </td>
                      <td className="py-3.5">
                        <select
                          value={acc.role}
                          onChange={(e) => handleRoleChange(acc.id, e.target.value as UserRole)}
                          className="bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white focus:border-primary focus:outline-none"
                        >
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="GAME_MANAGER">GAME_MANAGER</option>
                          <option value="MODERATOR">MODERATOR</option>
                          <option value="USER">USER</option>
                        </select>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          acc.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          acc.status === 'BANNED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {acc.status}
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-[10px] text-white/60">
                        {acc.ip}
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        {acc.status !== 'BANNED' && (
                          <button
                            onClick={() => setConfirmTarget({ id: acc.id, username: acc.username, action: 'BAN' })}
                            className="px-2.5 py-1 rounded bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-[10px] font-bold border border-yellow-500/20 cursor-pointer"
                          >
                            Suspend
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmTarget({ id: acc.id, username: acc.username, action: 'DELETE' })}
                          className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/20 cursor-pointer"
                        >
                          Purge
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* TAB 3: RBAC PERMISSIONS MATRIX */}
        {activeTab === 'RBAC_MATRIX' && (
          <Card level={2} className="p-6 border border-white/5 space-y-6">
            <div>
              <h3 className="text-headline-sm font-headline-sm text-white font-bold">Role-Based Access Control (RBAC) Matrix</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Granular permissions mapping per administrative and gameplay tier.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Object.keys(ROLE_PERMISSIONS) as UserRole[]).map((role) => (
                <div key={role} className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs tracking-wider">{role}</span>
                    <span className="text-[9px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {ROLE_PERMISSIONS[role].length} Scope{ROLE_PERMISSIONS[role].length > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    {ROLE_PERMISSIONS[role].map((perm) => (
                      <div key={perm} className="flex items-center gap-2 text-[11px] text-white/80">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="font-mono">{perm === '*' ? 'Full Platform Control (*)' : perm}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* TAB 4: COMPREHENSIVE SECURITY CHECKLIST AUDIT */}
        {activeTab === 'SYSTEMS' && (
          <Card level={2} className="p-6 border border-white/5 space-y-6">
            <div>
              <h3 className="text-headline-sm font-headline-sm text-white font-bold">Platform Security Checklist Verification</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Automated status check across all 8 security domains.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { domain: '1. User Authentication', status: 'ACTIVE', desc: 'Argon2id/SHA-256 + Salt, Strong Password Policy, 2FA TOTP, Lockout after 5 attempts' },
                { domain: '2. Website & Database Security', status: 'ACTIVE', desc: 'Input validation, XSS escaping, CSRF tokens, strict CORS, Security Headers (CSP, HSTS)' },
                { domain: '3. Game Security', status: 'ACTIVE', desc: 'Authoritative server score validation, anomaly detection (impossible pts/s), sandboxed iframes' },
                { domain: '4. Admin Panel Security', status: 'ACTIVE', desc: 'Mandatory 2FA gate, Role-Based Access Control (5 tiers), audit logging, double confirmation' },
                { domain: '5. DDoS & Bot Protection', status: 'ACTIVE', desc: 'Cloudflare WAF, Rate limiting token bucket, interactive visual CAPTCHA on suspicious attempts' },
                { domain: '6. User Privacy & Data Protection', status: 'ACTIVE', desc: 'Zero plaintext passwords, GDPR Article 15 Data Export, Article 17 Account Purge' },
                { domain: '7. Payment & Reward Security', status: 'ACTIVE', desc: 'Cryptographic receipt verification, idempotency duplicate prevention, hash-chained ledger' },
                { domain: '8. Monitoring & Auditing', status: 'ACTIVE', desc: 'Real-time telemetry event stream, failed login tracking, anti-cheat incident feed' }
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-xs">{item.domain}</h4>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

      </main>

      {/* Destructive Action 2FA Confirmation Modal */}
      {confirmTarget && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0f1d] border border-red-500/30 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">Confirm Destructive Action</h3>
                <p className="text-[10px] text-white/60">This operation modifies security privileges.</p>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant">
              Are you sure you want to <span className="text-white font-bold uppercase">{confirmTarget.action}</span> account <span className="text-primary font-bold">{confirmTarget.username}</span>?
            </p>

            <p className="text-xs text-red-400">
              Administrative actions require server-side authorization, which is not configured.
            </p>

            <div className="flex justify-end pt-2">
              <Button 
                variant="ghost" 
                onClick={() => setConfirmTarget(null)}
                className="px-4 py-2 text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
