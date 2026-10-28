import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { TopNavBar } from './components/layout/TopNavBar';
import { Footer } from './components/layout/Footer';

// Pages
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Library } from './pages/Library';
import { GameDetails } from './pages/GameDetails';
import { LudoGame } from './pages/LudoGame';
import { ChessGame } from './pages/ChessGame';
import { TicTacToeGame } from './pages/TicTacToeGame';
import { VoidSnakeGame } from './pages/VoidSnakeGame';
import { VelocityRacingGame } from './pages/VelocityRacingGame';
import { CyberUnoGame } from './pages/CyberUnoGame';
import { ZenCarromGame } from './pages/ZenCarromGame';
import { BattleArenaGame } from './pages/BattleArenaGame';
import { Connect4Game } from './pages/Connect4Game';
import { GomokuGame } from './pages/GomokuGame';
import { OthelloGame } from './pages/OthelloGame';
import { SnakesLaddersGame } from './pages/SnakesLaddersGame';
import { DominoesGame } from './pages/DominoesGame';
import { CheckersGame } from './pages/CheckersGame';
import { Matchmaking } from './pages/Matchmaking';
import { TournamentCenter } from './pages/TournamentCenter';
import { Marketplace } from './pages/Marketplace';
import { BattlePass } from './pages/BattlePass';
import { FriendsHub } from './pages/FriendsHub';
import { Profile } from './pages/Profile';
import { CloudPlay } from './pages/CloudPlay';
import { LiveBroadcast } from './pages/LiveBroadcast';
import { CreatorStudio } from './pages/CreatorStudio';
import { DeveloperPortal } from './pages/DeveloperPortal';
import { ClanHub } from './pages/ClanHub';
import { EmbedGame } from './pages/EmbedGame';
import { FlappyBirdGame } from './pages/FlappyBirdGame';
import { RetroSnakeGame } from './pages/RetroSnakeGame';
import { CyberSnakeGame } from './pages/CyberSnakeGame';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { NotFound } from './pages/NotFound';

// Protected Route Guard that preserves intended destination URL
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/auth" state={{ from: location }} replace />
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isStandalone = location.pathname.startsWith('/standalone/');
  const checkSession = useAuthStore((state) => state.checkSession);

  // Restore session from token on application startup
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface select-none">
      {/* Conditionally hide TopNavBar for embedded iframe mode */}
      {!isStandalone && <TopNavBar />}

      {/* Dynamic Route views */}
      <div className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Public & Accessible Game Discovery Routes */}
          <Route path="/library" element={<Library />} />
          <Route path="/game/:id" element={<GameDetails />} />
          <Route path="/play/embed/:gameId" element={<EmbedGame />} />

          {/* User Operations (Require Login) */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><FriendsHub /></ProtectedRoute>} />
          <Route path="/clan" element={<ProtectedRoute><ClanHub /></ProtectedRoute>} />
          <Route path="/matchmaking" element={<ProtectedRoute><Matchmaking /></ProtectedRoute>} />
          <Route path="/tournaments" element={<ProtectedRoute><TournamentCenter /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
          <Route path="/battlepass" element={<ProtectedRoute><BattlePass /></ProtectedRoute>} />
          <Route path="/cloud" element={<ProtectedRoute><CloudPlay /></ProtectedRoute>} />
          <Route path="/live" element={<ProtectedRoute><LiveBroadcast /></ProtectedRoute>} />
          <Route path="/creator" element={<ProtectedRoute><CreatorStudio /></ProtectedRoute>} />
          <Route path="/developer" element={<ProtectedRoute><DeveloperPortal /></ProtectedRoute>} />

          {/* Standalone Pure Game Routes for clean Iframe embedding */}
          <Route path="/standalone/neon_ludo" element={<LudoGame />} />
          <Route path="/standalone/chess_masters" element={<ChessGame />} />
          <Route path="/standalone/hyper_ttt" element={<TicTacToeGame />} />
          <Route path="/standalone/void_snake" element={<VoidSnakeGame />} />
          <Route path="/standalone/velocity_racing" element={<VelocityRacingGame />} />
          <Route path="/standalone/cyber_uno" element={<CyberUnoGame />} />
          <Route path="/standalone/zen_carrom" element={<ZenCarromGame />} />
          <Route path="/standalone/battle_arena" element={<BattleArenaGame />} />
          <Route path="/standalone/connect_4" element={<Connect4Game />} />
          <Route path="/standalone/gomoku" element={<GomokuGame />} />
          <Route path="/standalone/othello" element={<OthelloGame />} />
          <Route path="/standalone/snakes_ladders" element={<SnakesLaddersGame />} />
          <Route path="/standalone/dominoes" element={<DominoesGame />} />
          <Route path="/standalone/checkers" element={<CheckersGame />} />

          {/* Direct legacy Play Routes */}
          <Route path="/play/neon_ludo" element={<LudoGame />} />
          <Route path="/play/chess_masters" element={<ChessGame />} />
          <Route path="/play/hyper_ttt" element={<TicTacToeGame />} />
          <Route path="/play/void_snake" element={<VoidSnakeGame />} />
          <Route path="/play/retro_snake" element={<RetroSnakeGame />} />
          <Route path="/play/cyber_snake" element={<CyberSnakeGame />} />
          <Route path="/play/flappy_bird" element={<FlappyBirdGame />} />
          <Route path="/play/velocity_racing" element={<VelocityRacingGame />} />
          <Route path="/play/cyber_uno" element={<CyberUnoGame />} />
          <Route path="/play/zen_carrom" element={<ZenCarromGame />} />
          <Route path="/play/battle_arena" element={<BattleArenaGame />} />
          <Route path="/play/connect_4" element={<Connect4Game />} />
          <Route path="/play/gomoku" element={<GomokuGame />} />
          <Route path="/play/othello" element={<OthelloGame />} />
          <Route path="/play/snakes_ladders" element={<SnakesLaddersGame />} />
          <Route path="/play/dominoes" element={<DominoesGame />} />
          <Route path="/play/checkers" element={<CheckersGame />} />
          
          {/* Navigation Route Aliases */}
          <Route path="/clans" element={<Navigate to="/clan" replace />} />
          <Route path="/games" element={<Navigate to="/library" replace />} />
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
          <Route path="/moderation" element={<Navigate to="/dashboard" replace />} />
          <Route path="/liveops" element={<Navigate to="/dashboard" replace />} />

          {/* Legal Pages */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {/* Conditionally hide Footer for embedded iframe mode */}
      {!isStandalone && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
