-- SQL schema for Chess game data persistency
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_sessions (
    id VARCHAR(100) PRIMARY KEY,
    player_white_id INT REFERENCES users(id),
    player_black_id INT REFERENCES users(id),
    winner_color VARCHAR(10),
    fen_state VARCHAR(200),
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS moves (
    id SERIAL PRIMARY KEY,
    game_session_id VARCHAR(100) REFERENCES game_sessions(id),
    move_number INT NOT NULL,
    move_notation VARCHAR(10) NOT NULL,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
