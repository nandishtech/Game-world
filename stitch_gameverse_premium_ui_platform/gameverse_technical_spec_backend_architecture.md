# GameVerse Technical Architecture & Backend Specification

## 1. System Overview
GameVerse is an AI-native, high-performance multiplayer gaming platform. The architecture follows a monorepo structure (using Turborepo or similar) to share types and logic between the Next.js frontend and the Express.js/Socket.IO backend.

## 2. Database Schema (Prisma)

```prisma
// This is your Prisma schema file

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  USER
  MODERATOR
  ADMIN
}

enum MatchStatus {
  WAITING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model User {
  id            String    @id @default(cuid())
  username      String    @unique
  email         String    @unique
  passwordHash  String
  role          UserRole  @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  profile       Profile?
  stats         PlayerStats?
  matches       MatchPlayer[]
  friends       Friend[]      @relation("UserFriends")
  friendOf      Friend[]      @relation("FriendOfUser")
  notifications Notification[]
  achievements  UserAchievement[]
}

model Profile {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  avatarUrl   String?
  bio         String?
  country     String?
  level       Int      @default(1)
  xp          Int      @default(0)
  coins       Int      @default(0)
}

model PlayerStats {
  id          String @id @default(cuid())
  userId      String @unique
  user        User   @relation(fields: [userId], references: [id])
  wins        Int    @default(0)
  losses      Int    @default(0)
  rank        Int    @default(1000) // ELO
  hoursPlayed Float  @default(0)
}

model Match {
  id          String        @id @default(cuid())
  gameId      String
  status      MatchStatus   @default(WAITING)
  startTime   DateTime?
  endTime     DateTime?
  players     MatchPlayer[]
}

model MatchPlayer {
  matchId  String
  userId   String
  match    Match  @relation(fields: [matchId], references: [id])
  user     User   @relation(fields: [userId], references: [id])
  score    Int    @default(0)
  isWinner Boolean @default(false)

  @@id([matchId, userId])
}

model Friend {
  id        String   @id @default(cuid())
  userId    String
  friendId  String
  status    String   // PENDING, ACCEPTED, BLOCKED
  user      User     @relation("UserFriends", fields: [userId], references: [id])
  friend    User     @relation("FriendOfUser", fields: [friendId], references: [id])
  createdAt DateTime @default(now())
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  type      String   // FRIEND_REQUEST, MATCH_FOUND, ACHIEVEMENT
  content   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}

model Achievement {
  id          String   @id @default(cuid())
  name        String
  description String
  xpReward    Int
  users       UserAchievement[]
}

model UserAchievement {
  userId        String
  achievementId String
  user          User        @relation(fields: [userId], references: [id])
  achievement   Achievement @relation(fields: [achievementId], references: [id])
  unlockedAt    DateTime    @default(now())

  @@id([userId, achievementId])
}
```

## 3. Real-time Communication (Socket.IO Events)

### Connection & Auth
- `connection`: Client connects with JWT in handshake.
- `authenticated`: Server confirms session validity.

### Matchmaking
- `queue:join`: { gameId, region } - User enters matchmaking.
- `queue:leave`: User leaves queue.
- `match:found`: { matchId, opponentInfo } - Server signals match ready.
- `match:accept`: User confirms participation.

### Game State (Authoritative Server)
- `game:start`: All players ready, match begins.
- `game:move`: { action, timestamp } - Client sends intent.
- `game:sync`: { state, sequence } - Server broadcasts authoritative state.
- `game:end`: Match finished, rewards calculated.

### Social & Presence
- `presence:update`: { status: 'ONLINE' | 'IN_MATCH' | 'AWAY' }
- `chat:send`: { roomId, message }
- `notification:new`: Server pushes real-time alerts.

## 4. API Endpoints (REST)

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register` | POST | Create new account |
| `/api/auth/login` | POST | Authenticate and get tokens |
| `/api/profile` | GET/PATCH | Manage user details |
| `/api/leaderboard` | GET | Fetch global/friend rankings |
| `/api/matches/history`| GET | Retrieve past game performance |

## 5. Security Strategy
- **JWT + Refresh Tokens**: Secure cookie-based session management.
- **Zod Validation**: Strict schema enforcement for all API and Socket payloads.
- **Rate Limiting**: Protection against DDoS and brute force on sensitive routes.
- **Authoritative Game Logic**: All game state transitions computed on the server to prevent memory-hacking.
