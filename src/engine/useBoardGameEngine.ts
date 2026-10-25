import { useState, useEffect, useRef } from 'react';
import { BoardGameEngine, BoardGameEngineOptions, EnginePlayer, EngineGameState, GameMove } from './BoardGameEngine';
import { useAuthStore } from '../store/useAuthStore';

export function useBoardGameEngine<TBoardState, TMove>(
  options: Omit<BoardGameEngineOptions<TBoardState, TMove>, 'onStateChange' | 'onGameEnd'>
) {
  const { addXP, addCoins } = useAuthStore();
  
  // React mirror states
  const [boardState, setBoardState] = useState<TBoardState>(options.initialBoardState());
  const [players, setPlayers] = useState<EnginePlayer[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [gameState, setGameState] = useState<EngineGameState>('idle');
  const [moveHistory, setMoveHistory] = useState<GameMove<TMove>[]>([]);
  const [spectators, setSpectators] = useState<string[]>([]);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [isDraw, setIsDraw] = useState(false);

  // Engine instance ref
  const engineRef = useRef<BoardGameEngine<TBoardState, TMove> | null>(null);

  // Initialize engine
  if (!engineRef.current) {
    engineRef.current = new BoardGameEngine<TBoardState, TMove>({
      ...options,
      onStateChange: (engine) => {
        setBoardState(engine.boardState);
        setPlayers([...engine.players]);
        setActivePlayerIndex(engine.activePlayerIndex);
        setGameState(engine.gameState);
        setMoveHistory([...engine.moveHistory]);
        setSpectators([...engine.spectators]);
        setWinnerIndex(engine.winnerIndex);
        setIsDraw(engine.isDraw);
      },
      onGameEnd: (winnerIdx, rewards) => {
        if (winnerIdx !== null) {
          const wPlayer = engineRef.current?.players[winnerIdx];
          if (wPlayer && !wPlayer.isBot) {
            addXP(rewards.xp);
            addCoins(rewards.coins);
          }
        } else {
          // Draw rewards
          addXP(rewards.xp);
          addCoins(rewards.coins);
        }
      }
    });
  }

  // Auto Bot loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const activePlayer = players[activePlayerIndex];
    if (activePlayer && activePlayer.isBot) {
      const delay = setTimeout(() => {
        const botMove = engineRef.current?.botDecision();
        if (botMove !== null && botMove !== undefined) {
          engineRef.current?.makeMove(activePlayerIndex, botMove, 'Bot Action');
        } else {
          // If bot has no moves, auto pass or draw
          engineRef.current?.endGame(null);
        }
      }, 1000); // 1s bot delay
      return () => clearTimeout(delay);
    }
  }, [activePlayerIndex, gameState, players]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      engineRef.current?.stopTimer();
    };
  }, []);

  const setupGame = (gamePlayers: EnginePlayer[], timerDurationSeconds: number = 300) => {
    engineRef.current?.setupGame(gamePlayers, timerDurationSeconds);
  };

  const makeMove = (playerIndex: number, move: TMove, notation?: string) => {
    return engineRef.current?.makeMove(playerIndex, move, notation) || false;
  };

  const pauseGame = () => engineRef.current?.pauseGame();
  const resumeGame = () => engineRef.current?.resumeGame();
  const resignGame = (playerIndex: number) => {
    const winnerIdx = (playerIndex + 1) % (engineRef.current?.players.length || 2);
    engineRef.current?.endGame(winnerIdx);
  };

  return {
    boardState,
    players,
    activePlayerIndex,
    gameState,
    moveHistory,
    spectators,
    winnerIndex,
    isDraw,
    setupGame,
    makeMove,
    pauseGame,
    resumeGame,
    resignGame,
    addSpectator: (user: string) => engineRef.current?.addSpectator(user),
    removeSpectator: (user: string) => engineRef.current?.removeSpectator(user)
  };
}
