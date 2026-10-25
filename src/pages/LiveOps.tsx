import React from 'react';
import { Card } from '../components/Card';
import { ShaderBackground } from '../components/ShaderBackground';
import { Server, Activity, Globe, Wifi } from 'lucide-react';

const REGIONS = [
  { name: 'US EAST', status: 'ONLINE', ping: '12ms', load: '65%', color: 'text-green-400' },
  { name: 'US WEST', status: 'ONLINE', ping: '24ms', load: '40%', color: 'text-green-400' },
  { name: 'EU CENTRAL', status: 'ONLINE', ping: '85ms', load: '82%', color: 'text-green-400' },
  { name: 'ASIA PACIFIC', status: 'ONLINE', ping: '140ms', load: '30%', color: 'text-green-400' }
];

export const LiveOps: React.FC = () => {
  return (
    <div className="relative min-h-screen pt-24 pb-12 bg-background">
      <ShaderBackground type="core" />

      <main className="relative z-10 max-w-container-max mx-auto px-margin-desktop space-y-8">
        
        {/* Title */}
        <div>
          <h1 className="text-headline-xl font-headline-xl text-white font-bold">Global Live Ops Dashboard</h1>
          <p className="text-xs text-on-surface-variant mt-1.5">Real-time status updates from infrastructure instances and data relay channels.</p>
        </div>

        {/* Region Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {REGIONS.map((region) => (
            <Card key={region.name} level={2} className="p-5 border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white uppercase">{region.name}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border border-green-500/20 bg-green-500/5 ${region.color}`}>
                  {region.status}
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-on-surface-variant font-semibold">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5" /> Direct Ping</span>
                  <span className="text-white font-bold">{region.ping}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Node Load</span>
                  <span className="text-white font-bold">{region.load}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* System Logs */}
        <Card level={2} className="p-6 border border-white/5 space-y-6">
          <h3 className="text-headline-sm font-headline-sm text-white font-bold flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" /> Live Infrastructure Logs
          </h3>

          <div className="bg-[#050505] p-5 rounded-xl border border-white/10 font-mono text-[10px] text-on-surface-variant/80 space-y-2.5 max-h-64 overflow-y-auto">
            <div>[11:58:02 PM] [INFO] Matchmaking queue solver completed segment index calculations.</div>
            <div>[11:58:14 PM] [INFO] Synchronized ELO rank updates with database cluster secondary-0.</div>
            <div>[11:58:29 PM] [WARNING] Region EU CENTRAL load threshold exceeded 80%. Spinning up node container #42...</div>
            <div>[11:58:32 PM] [INFO] Relayed active voice connection channels. Latency verified at 14ms.</div>
          </div>
        </Card>

      </main>
    </div>
  );
};
