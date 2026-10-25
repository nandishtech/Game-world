import React from 'react';
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

// Simple Route Guard for Private/Protected routes
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isStandalone = location.pathname.startsWith('/standalone/');

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface select-none">
      {/* Conditionally hide TopNavBar for embedded iframe mode */}
      {!isStandalone && <TopNavBar />}

      {/* Dynamic Route views */}
      <div className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
          <Route path="/game/:id" element={<ProtectedRoute><GameDetails /></ProtectedRoute>} />
          
          {/* Universal Iframe Player Route */}
          <Route path="/play/embed/:gameId" element={<ProtectedRoute><EmbedGame /></ProtectedRoute>} />

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
          <Route path="/play/neon_ludo" element={<ProtectedRoute><LudoGame /></ProtectedRoute>} />
          <Route path="/play/chess_masters" element={<ProtectedRoute><ChessGame /></ProtectedRoute>} />
          <Route path="/play/hyper_ttt" element={<ProtectedRoute><TicTacToeGame /></ProtectedRoute>} />
          <Route path="/play/void_snake" element={<ProtectedRoute><VoidSnakeGame /></ProtectedRoute>} />
          <Route path="/play/retro_snake" element={<ProtectedRoute><RetroSnakeGame /></ProtectedRoute>} />
          <Route path="/play/cyber_snake" element={<ProtectedRoute><CyberSnakeGame /></ProtectedRoute>} />
          <Route path="/play/flappy_bird" element={<ProtectedRoute><FlappyBirdGame /></ProtectedRoute>} />
          <Route path="/play/velocity_racing" element={<ProtectedRoute><VelocityRacingGame /></ProtectedRoute>} />
          <Route path="/play/cyber_uno" element={<ProtectedRoute><CyberUnoGame /></ProtectedRoute>} />
          <Route path="/play/zen_carrom" element={<ProtectedRoute><ZenCarromGame /></ProtectedRoute>} />
          <Route path="/play/battle_arena" element={<ProtectedRoute><BattleArenaGame /></ProtectedRoute>} />
          <Route path="/play/connect_4" element={<ProtectedRoute><Connect4Game /></ProtectedRoute>} />
          <Route path="/play/gomoku" element={<ProtectedRoute><GomokuGame /></ProtectedRoute>} />
          <Route path="/play/othello" element={<ProtectedRoute><OthelloGame /></ProtectedRoute>} />
          <Route path="/play/snakes_ladders" element={<ProtectedRoute><SnakesLaddersGame /></ProtectedRoute>} />
          <Route path="/play/dominoes" element={<ProtectedRoute><DominoesGame /></ProtectedRoute>} />
          <Route path="/play/checkers" element={<ProtectedRoute><CheckersGame /></ProtectedRoute>} />
          
          {/* Platform Centers */}
          <Route path="/matchmaking" element={<ProtectedRoute><Matchmaking /></ProtectedRoute>} />
          <Route path="/tournaments" element={<ProtectedRoute><TournamentCenter /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
          <Route path="/battlepass" element={<ProtectedRoute><BattlePass /></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><FriendsHub /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/cloud" element={<ProtectedRoute><CloudPlay /></ProtectedRoute>} />
          <Route path="/live" element={<ProtectedRoute><LiveBroadcast /></ProtectedRoute>} />
          <Route path="/creator" element={<ProtectedRoute><CreatorStudio /></ProtectedRoute>} />
          <Route path="/developer" element={<ProtectedRoute><DeveloperPortal /></ProtectedRoute>} />
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
          <Route path="/moderation" element={<Navigate to="/dashboard" replace />} />
          <Route path="/liveops" element={<Navigate to="/dashboard" replace />} />
          <Route path="/clan" element={<ProtectedRoute><ClanHub /></ProtectedRoute>} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          
          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
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
