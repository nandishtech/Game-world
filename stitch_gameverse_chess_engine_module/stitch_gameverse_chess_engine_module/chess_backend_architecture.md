# GameVerse Chess Architecture & Backend Specification

## 1. Modular Board Game Engine (Core)
The system uses a `BaseGameEngine` class that manages turns, players, and match state. Chess extends this with specific logic.

### Core Domain Models
- `Board`: 8x8 grid management.
- `Piece`: Abstract base class with `type`, `color`, `position`.
- `Move`: Validated coordinate change with piece metadata.
- `TurnManager`: Handles sequential flow and timers.

## 2. Prisma Database Schema
```prisma
model ChessMatch {
  id            String         @id @default(uuid())
  status        MatchStatus    @default(PENDING)
  whitePlayerId String
  blackPlayerId String
  whitePlayer   User           @relation("WhitePlayer", fields: [whitePlayerId], references: [id])
  blackPlayer   User           @relation("BlackPlayer", fields: [blackPlayerId], references: [id])
  boardState    String         // FEN string
  moves         ChessMove[]
  startTime     DateTime?
  endTime       DateTime?
  winnerId      String?
  drawReason    DrawReason?
  timeControl   String         // e.g., "15+10"
  clocks        ChessClock[]
}

model ChessMove {
  id        String   @id @default(uuid())
  matchId   String
  match     ChessMatch @relation(fields: [matchId], references: [id])
  notation  String   // SAN notation (e.g., e4, Nf3)
  from      String
  to        String
  timestamp DateTime @default(now())
  fenAfter  String
}

model ChessRating {
  userId    String @id
  blitz     Int    @default(1200)
  rapid     Int    @default(1200)
  classical Int    @default(1200)
  puzzles   Int    @default(1200)
}
```

## 3. Socket.IO Events
- `game:join`: Join a match room.
- `game:move`: Submit a move (validated server-side).
- `game:sync`: Fetch latest state on reconnect.
- `game:draw_offer`: Initiate or respond to draw.
- `game:resign`: Concede match.

## 4. Server-Authoritative Logic
The backend runs a headless chess engine (like `chess.js` or a custom TS implementation) to validate:
1. Is it the player's turn?
2. Is the piece owned by the player?
3. Is the move legally possible for that piece?
4. Does the move result in check?
5. Has a win/draw condition been met?
