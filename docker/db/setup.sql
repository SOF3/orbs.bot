CREATE TABLE IF NOT EXISTS game (
    id          INT PRIMARY KEY,
    startTime   BIGINT NOT NULL,
    endTime     BIGINT NULL,
    endGameTime FLOAT  NULL,
    badEnd      BOOL   NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS game_player (
    game         INT          NOT NULL,
    playerId     INT          NOT NULL,
    name         VARCHAR(255) NOT NULL,
    isBot        BOOLEAN      NOT NULL,
    botId        INT          NULL,
    loseTime     BIGINT       NULL,
    loseGameTime DOUBLE       NULL,
    PRIMARY KEY (game, name),
    KEY (game, playerId),
    KEY (name),
    FOREIGN KEY (game) REFERENCES game(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS game_shot (
    game        INT   NOT NULL,
    orb         INT   NOT NULL,
    player      INT   NOT NULL,
    direction_x FLOAT NOT NULL,
    direction_y FLOAT NOT NULL,
    gameTime    FLOAT NOT NULL,
    KEY (game, player),
    KEY (game, orb),
    KEY (game, gameTime),
    FOREIGN KEY (game) REFERENCES game(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (game, player) REFERENCES game_player(game, playerId) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS game_conquer (
    game     INT   NOT NULL,
    orb      INT   NOT NULL,
    player   INT   NOT NULL,
    gameTime FLOAT NOT NULL,
    KEY (game, player),
    KEY (game, orb),
    KEY (game, gameTime),
    FOREIGN KEY (game) REFERENCES game(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (game, player) REFERENCES game_player(game, playerId) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS game_special (
    game     INT   NOT NULL,
    orb      INT   NOT NULL,
    player   INT   NOT NULL,
    type     INT   NOT NULL, -- 21 or 23
    gameTime FLOAT NOT NULL,
    KEY (game, player),
    KEY (game, orb),
    KEY (game, gameTime),
    FOREIGN KEY (game) REFERENCES game(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (game, player) REFERENCES game_player(game, playerId) ON UPDATE CASCADE ON DELETE CASCADE
);
