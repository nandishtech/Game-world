export interface EnginePlayer {
  id: string;
  name: string;
  avatar: string;
  color: string;
  rank: number;
  isBot: boolean;
  timeRemaining: number; // in seconds
}

export interface GameMove<TMove> {
  playerIndex: number;
  move: TMove;
  timestamp: number;
  notation?: string;
}

export type EngineGameState = 'idle' | 'matching' | 'playing' | 'paused' | 'finished';

export interface BoardGameEngineOptions<TBoardState, TMove> {
  gameName: string;
  initialBoardState: () => TBoardState;
  getValidMoves: (playerIndex: number, boardState: TBoardState) => TMove[];
  applyMove: (boardState: TBoardState, move: TMove, playerIndex: number) => TBoardState;
  checkWin: (boardState: TBoardState, playerIndex: number) => boolean;
  checkDraw: (boardState: TBoardState) => boolean;
  onStateChange?: (state: BoardGameEngine<TBoardState, TMove>) => void;
  onGameEnd?: (winnerIndex: number | null, rewards: { xp: number; coins: number }) => void;
}

export class BoardGameEngine<TBoardState, TMove> {
  public gameName: string;
  public players: EnginePlayer[] = [];
  public activePlayerIndex: number = 0;
  public boardState: TBoardState;
  public gameState: EngineGameState = 'idle';
  public moveHistory: GameMove<TMove>[] = [];
  public spectators: string[] = [];
  public winnerIndex: number | null = null;
  public isDraw: boolean = false;
  
  // Game clock timer
  public timerDuration: number = 300; // 5 min default
  private timerInterval: any = null;

  // Options callbacks
  private initialBoardState: () => TBoardState;
  private getValidMoves: (playerIndex: number, boardState: TBoardState) => TMove[];
  private applyMove: (boardState: TBoardState, move: TMove, playerIndex: number) => TBoardState;
  private checkWin: (boardState: TBoardState, playerIndex: number) => boolean;
  private checkDraw: (boardState: TBoardState) => boolean;
  private onStateChange?: (state: BoardGameEngine<TBoardState, TMove>) => void;
  private onGameEnd?: (winnerIndex: number | null, rewards: { xp: number; coins: number }) => void;

  constructor(options: BoardGameEngineOptions<TBoardState, TMove>) {
    this.gameName = options.gameName;
    this.initialBoardState = options.initialBoardState;
    this.getValidMoves = options.getValidMoves;
    this.applyMove = options.applyMove;
    this.checkWin = options.checkWin;
    this.checkDraw = options.checkDraw;
    this.onStateChange = options.onStateChange;
    this.onGameEnd = options.onGameEnd;
    this.boardState = this.initialBoardState();
  }

  public setupGame(players: EnginePlayer[], timerDurationSeconds: number = 300) {
    this.players = players.map(p => ({
      ...p,
      timeRemaining: timerDurationSeconds
    }));
    this.timerDuration = timerDurationSeconds;
    this.boardState = this.initialBoardState();
    this.activePlayerIndex = 0;
    this.moveHistory = [];
    this.winnerIndex = null;
    this.isDraw = false;
    this.gameState = 'playing';
    
    this.startTimer();
    this.triggerChange();
  }

  public makeMove(playerIndex: number, move: TMove, notation?: string): boolean {
    if (this.gameState !== 'playing') return false;
    if (playerIndex !== this.activePlayerIndex) {
      console.warn("Anti-Cheat: Not player's turn to act.");
      return false; // Turn Anti-Cheat
    }

    // Move Anti-Cheat
    const valid = this.getValidMoves(playerIndex, this.boardState);
    const isMoveValid = valid.some(v => JSON.stringify(v) === JSON.stringify(move));
    if (!isMoveValid) {
      console.warn("Anti-Cheat: Unauthorized move attempted.");
      return false; 
    }

    // Apply Move
    this.boardState = this.applyMove(this.boardState, move, playerIndex);
    this.moveHistory.push({
      playerIndex,
      move,
      timestamp: Date.now(),
      notation
    });

    // Check Win/Draw
    if (this.checkWin(this.boardState, playerIndex)) {
      this.endGame(playerIndex);
      return true;
    }

    if (this.checkDraw(this.boardState)) {
      this.endGame(null);
      return true;
    }

    // Toggle turn
    this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
    this.triggerChange();
    return true;
  }

  public botDecision(): TMove | null {
    const valid = this.getValidMoves(this.activePlayerIndex, this.boardState);
    if (valid.length === 0) return null;
    // Greedy heuristic / random fallback for generic engine bot
    return valid[Math.floor(Math.random() * valid.length)];
  }

  private startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (this.gameState !== 'playing') return;

      const activePlayer = this.players[this.activePlayerIndex];
      if (activePlayer) {
        activePlayer.timeRemaining = Math.max(0, activePlayer.timeRemaining - 1);
        if (activePlayer.timeRemaining <= 0) {
          // Time out loss
          const winnerIndex = (this.activePlayerIndex + 1) % this.players.length;
          this.endGame(winnerIndex);
        } else {
          this.triggerChange();
        }
      }
    }, 1000);
  }

  public stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public pauseGame() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
      this.stopTimer();
      this.triggerChange();
    }
  }

  public resumeGame() {
    if (this.gameState === 'paused') {
      this.gameState = 'playing';
      this.startTimer();
      this.triggerChange();
    }
  }

  public endGame(winnerIdx: number | null) {
    this.gameState = 'finished';
    this.stopTimer();
    this.winnerIndex = winnerIdx;
    this.isDraw = winnerIdx === null;

    let xpReward = 50; // Draw
    let coinsReward = 20;

    if (winnerIdx !== null) {
      const winner = this.players[winnerIdx];
      if (winner && !winner.isBot) {
        xpReward = 150;
        coinsReward = 100;
      } else {
        xpReward = 25; // Lost vs bot/other
        coinsReward = 10;
      }
    }

    if (this.onGameEnd) {
      this.onGameEnd(winnerIdx, { xp: xpReward, coins: coinsReward });
    }
    this.triggerChange();
  }

  public addSpectator(username: string) {
    if (!this.spectators.includes(username)) {
      this.spectators.push(username);
      this.triggerChange();
    }
  }

  public removeSpectator(username: string) {
    this.spectators = this.spectators.filter(u => u !== username);
    this.triggerChange();
  }

  private triggerChange() {
    if (this.onStateChange) {
      this.onStateChange(this);
    }
  }
}
