import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ShaderBackground } from '../components/ShaderBackground';
import { Compass, ArrowLeft, Gamepad2, Sparkles } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen pt-24 pb-12 bg-background flex flex-col items-center justify-center text-white px-4">
      <ShaderBackground type="universe" />

      <Card level={2} className="relative z-10 p-8 sm:p-12 text-center max-w-lg w-full space-y-6 border border-white/10 bg-black/60 backdrop-blur-2xl shadow-2xl rounded-3xl">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
          <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '12s' }} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono uppercase tracking-widest">
            <span>Sector Coordinates Unreachable • 404</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wider">
            LOST IN HYPERSPACE
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
            The navigational beacon you requested does not exist or has drifted outside the Game World galaxy.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            variant="neon"
            className="flex items-center justify-center gap-2 py-3 px-6 text-xs font-bold tracking-wider cursor-pointer"
            onClick={() => navigate('/library')}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>EXPLORE GAME LIBRARY</span>
          </Button>

          <Button
            variant="ghost"
            className="flex items-center justify-center gap-2 py-3 px-6 text-xs font-bold border border-white/10 hover:border-white/30 text-white/80 hover:text-white cursor-pointer"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN HOME</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};
