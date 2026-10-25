import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ShaderBackground } from '../components/ShaderBackground';
import { 
  Award, 
  User, 
  Settings, 
  Globe, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Smartphone, 
  Download, 
  Trash2, 
  LogOut, 
  Edit3, 
  Save, 
  Key,
  CheckCircle2
} from 'lucide-react';
import { privacyService } from '../services/privacyService';
import { generate2FADetails } from '../services/securityService';

const ACHIEVEMENTS = [
  { id: 'a1', title: 'Hexa-Kill Specialist', desc: 'Secure 6 kills in a single match session.', unlocked: true },
  { id: 'a2', title: 'Vanguard Initiate', desc: 'Reach Level 10 on the seasonal battlepass.', unlocked: true },
  { id: 'a3', title: 'Coin Collector', desc: 'Deduct and complete 3 purchases in store.', unlocked: false }
];

export const Profile: React.FC = () => {
  const { user, updateBio, enable2FA, disable2FA, logoutAllDevices, deleteAccount } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SECURITY' | 'PRIVACY'>('OVERVIEW');
  const [isEditing, setIsEditing] = useState(false);
  const [bioText, setBioText] = useState(user?.bio || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');

  if (!user) return null;

  const handleSaveBio = (e: React.FormEvent) => {
    e.preventDefault();
    updateBio(bioText);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleToggle2FA = () => {
    if (user.is2FAEnabled) {
      disable2FA();
    } else {
      const details = generate2FADetails(user.username);
      enable2FA(details.secret, details.backupCodes);
    }
  };

  const handleExportData = () => {
    privacyService.exportUserData(user);
  };

  const handleExecuteDeleteAccount = () => {
    if (confirmDeleteText !== user.username) return;
    deleteAccount();
  };

  return (
    <div className="relative min-h-screen pt-24 pb-12 bg-background">
      <ShaderBackground type="core" />

      <main className="relative z-10 max-w-container-max mx-auto px-margin-desktop space-y-8">
        
        {/* Profile Card Header */}
        <Card level={2} className="p-6 md:p-8 border border-white/5">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            
            {/* Avatar & Info */}
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left w-full">
              <div className="relative w-24 h-24 rounded-full border-2 border-primary overflow-hidden">
                <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-2 flex-grow">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-white leading-none">{user.username}</h1>
                  <span className="bg-primary/10 border border-primary/20 text-primary text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                    Rank ELO {user.stats.rank}
                  </span>
                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> {user.role}
                  </span>
                </div>
                
                <p className="text-xs text-on-surface-variant flex items-center justify-center md:justify-start gap-1">
                  <Globe className="w-4 h-4 text-on-surface-variant" /> {user.country} • Verified Player ID: {user.id}
                </p>

                {/* Level Node bar */}
                <div className="w-full max-w-sm pt-2">
                  <div className="flex justify-between text-[10px] text-on-surface-variant font-bold mb-1">
                    <span>Level {user.level}</span>
                    <span>{user.xp}/100 XP</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full transition-all duration-500" style={{ width: `${user.xp}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation Pill Group */}
            <div className="flex items-center gap-1 bg-black/60 border border-white/10 p-1 rounded-xl flex-shrink-0">
              <button
                onClick={() => setActiveTab('OVERVIEW')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'OVERVIEW' ? 'bg-primary text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('SECURITY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'SECURITY' ? 'bg-primary text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" /> 2FA & Security
              </button>
              <button
                onClick={() => setActiveTab('PRIVACY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'PRIVACY' ? 'bg-primary text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5" /> Privacy & GDPR
              </button>
            </div>

          </div>
        </Card>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            
            {/* Left Columns: Bio and Achievements */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Bio Editor */}
              <Card level={2} className="p-6 border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-headline-sm font-headline-sm text-white font-bold">Commander Biography</h3>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-primary font-bold flex items-center gap-1.5 hover:underline"
                    >
                      <Edit3 className="w-4 h-4" /> Edit Biography
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSaveBio} className="space-y-4">
                    <textarea
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      rows={4}
                      maxLength={200}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/45 transition-all resize-none placeholder-white/20"
                      required
                    />
                    <div className="flex gap-2 justify-end">
                      <Button type="submit" variant="neon" className="px-5 py-2 text-xs">
                        Save Dispatch <Save className="w-4 h-4" />
                      </Button>
                      <Button variant="glass" onClick={() => { setIsEditing(false); setBioText(user.bio); }} className="px-5 py-2 text-xs">
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-on-surface-variant leading-relaxed bg-[#050505]/40 border border-white/5 p-4 rounded-xl">
                      {user.bio || 'No details recorded in player database.'}
                    </p>
                    {saveSuccess && (
                      <span className="text-[10px] text-green-400 font-bold block pt-1">
                        ✓ Profile bio logs updated successfully.
                      </span>
                    )}
                  </div>
                )}
              </Card>

              {/* Achievements List */}
              <Card level={2} className="p-6 border border-white/5">
                <h3 className="text-headline-sm font-headline-sm text-white font-bold mb-6">Combat Ribbons & Achievements</h3>
                
                <div className="space-y-4">
                  {ACHIEVEMENTS.map((a) => (
                    <div 
                      key={a.id} 
                      className={`flex items-center justify-between p-4 rounded-xl border ${a.unlocked ? 'bg-primary/5 border-primary/20' : 'bg-[#050505]/40 border-white/5 opacity-60'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Award className={`w-8 h-8 ${a.unlocked ? 'text-primary' : 'text-on-surface-variant/40'}`} />
                        <div>
                          <h4 className="text-xs font-bold text-white">{a.title}</h4>
                          <p className="text-[10px] text-on-surface-variant leading-normal mt-0.5">{a.desc}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${a.unlocked ? 'bg-primary/5 text-primary border-primary/20' : 'bg-white/5 text-on-surface-variant/40 border-white/5'}`}>
                        {a.unlocked ? 'UNLOCKED' : 'LOCKED'}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

            </div>

            {/* Right Column: Platform stats card */}
            <Card level={2} className="p-6 border border-white/5 space-y-6">
              <h3 className="text-headline-sm font-headline-sm text-white font-bold">Platform Stats Details</h3>
              
              <div className="space-y-4 text-xs font-semibold text-on-surface-variant">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Rank ELO Score</span>
                  <span className="text-white font-bold">{user.stats.rank}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Win Rate (W / L)</span>
                  <span className="text-green-400 font-bold">
                    {user.stats.wins + user.stats.losses > 0 
                      ? `${Math.round((user.stats.wins / (user.stats.wins + user.stats.losses)) * 100)}% (${user.stats.wins}W / ${user.stats.losses}L)`
                      : '0% (0W / 0L)'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Total Matches Completed</span>
                  <span className="text-white font-bold">{user.stats.wins + user.stats.losses} sessions</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>XP Progress Threshold</span>
                  <span className="text-primary font-bold">{user.xp}% to next Level</span>
                </div>
                <div className="flex justify-between">
                  <span>Squad Role Privilege</span>
                  <span className="text-secondary font-bold uppercase">{user.role}</span>
                </div>
              </div>
            </Card>

          </div>
        )}

        {/* TAB 2: 2FA & ACCOUNT SECURITY */}
        {activeTab === 'SECURITY' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 2FA Authenticator Section */}
            <Card level={2} className="p-6 border border-white/5 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Two-Factor Authentication (2FA)</h3>
                    <p className="text-[10px] text-on-surface-variant">Protects account with TOTP authenticator app verification.</p>
                  </div>
                </div>

                <button
                  onClick={handleToggle2FA}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    user.is2FAEnabled 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
                      : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  {user.is2FAEnabled ? 'Deactivate 2FA' : 'Enable 2FA'}
                </button>
              </div>

              {user.is2FAEnabled ? (
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Two-Factor Protection is Active
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[10px] text-white/60 font-semibold">Authenticator Secret Key:</span>
                    <div className="p-2.5 bg-black/60 border border-white/10 rounded-lg font-mono text-xs text-primary tracking-widest">
                      {user.twoFactorSecret}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-white/60 font-semibold">Emergency Recovery Codes:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {user.recoveryCodes?.map((code, idx) => (
                        <span key={idx} className="p-2 bg-black/40 border border-white/5 rounded font-mono text-[11px] text-white/90 text-center">
                          {code}
                        </span>
                      ))}
                    </div>
                    <p className="text-[9px] text-on-surface-variant">Store these one-time recovery codes in a secure offline vault.</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl text-xs text-on-surface-variant space-y-2">
                  <p>Enabling 2FA adds an extra layer of defense against password theft and unauthorized station logins.</p>
                  <p className="text-white/80 font-semibold">Supported apps: Google Authenticator, 1Password, Authy, Microsoft Authenticator.</p>
                </div>
              )}
            </Card>

            {/* Active Device Sessions */}
            <Card level={2} className="p-6 border border-white/5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Device Stations</h3>
                  <p className="text-[10px] text-on-surface-variant">Sessions currently authorized with your credentials.</p>
                </div>
                <button
                  onClick={logoutAllDevices}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold border border-white/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Terminate Others
                </button>
              </div>

              <div className="space-y-3">
                {user.activeSessions.map((sess) => (
                  <div key={sess.id} className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{sess.device}</span>
                        {sess.current && (
                          <span className="text-[8px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/30 uppercase">
                            This Device
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-on-surface-variant mt-0.5">
                        {sess.location} • IP {sess.ip}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-white/50">{sess.lastActive}</span>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        )}

        {/* TAB 3: PRIVACY & GDPR DATA RIGHTS */}
        {activeTab === 'PRIVACY' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* GDPR Export My Data */}
            <Card level={2} className="p-6 border border-white/5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">GDPR Article 15 Data Export</h3>
                  <p className="text-[10px] text-on-surface-variant">Download a complete, machine-readable JSON archive of your platform data.</p>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                Pursuant to GDPR Article 15 and CCPA guidelines, you have the right to obtain confirmation and a full export of all personal data, gameplay statistics, transaction histories, and security logs linked to your profile.
              </p>

              <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-[11px] text-white/70 space-y-1">
                <div>• User Profile & Verification Metadata</div>
                <div>• Matchmaking ELO & Historical Statistics</div>
                <div>• Cryptographic Wallet & Transaction Ledger</div>
                <div>• Authorized Device Access Logs</div>
              </div>

              <button
                onClick={handleExportData}
                className="w-full py-3 bg-primary text-black font-bold rounded-xl text-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
              >
                <Download className="w-4 h-4" /> GENERATE & DOWNLOAD JSON ARCHIVE
              </button>
            </Card>

            {/* GDPR Right to be Forgotten */}
            <Card level={2} className="p-6 border border-red-500/20 bg-red-950/10 space-y-4">
              <div className="flex items-center gap-3 text-red-400">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">GDPR Article 17 Account Purge</h3>
                  <p className="text-[10px] text-white/60">Permanently erase your identity and platform records.</p>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                Exercising your "Right to be Forgotten" permanently purges your account, leaderboard scores, coin wallet, inventory, and session credentials. This action is irrevocable.
              </p>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> REQUEST ACCOUNT DELETION
              </button>
            </Card>

          </div>
        )}

      </main>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0f1d] border border-red-500/30 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <ShieldAlert className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">Confirm Account Erasure</h3>
                <p className="text-[10px] text-white/60">Irreversible Action under GDPR Article 17</p>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant">
              To proceed with permanent deletion, type your username <span className="text-white font-bold">{user.username}</span> in the box below:
            </p>

            <input
              type="text"
              value={confirmDeleteText}
              onChange={(e) => setConfirmDeleteText(e.target.value)}
              placeholder={user.username}
              className="w-full bg-black/60 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-red-400"
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="ghost" 
                onClick={() => { setShowDeleteModal(false); setConfirmDeleteText(''); }}
                className="px-4 py-2 text-xs"
              >
                Cancel
              </Button>
              <button
                disabled={confirmDeleteText !== user.username}
                onClick={handleExecuteDeleteAccount}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-red-600/30 transition-all"
              >
                Permanently Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
