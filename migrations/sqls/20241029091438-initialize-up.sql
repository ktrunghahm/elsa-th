CREATE TABLE quiz
(
    id          UUID NOT NULL PRIMARY KEY,
    name        VARCHAR(127) NOT NULL,
    content     JSON NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE,
    updated_at  TIMESTAMP WITH TIME ZONE,
    UNIQUE(name)
);

CREATE TABLE quiz_taking
(
    quiz_id         UUID NOT NULL,
    user_email      VARCHAR(255) NOT NULL,
    answers         JSON NOT NULL,
    total_score     INT NOT NULL,
    attempt_count   INT NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (quiz_id, user_email),
    CONSTRAINT fk_quiz_taking_quiz_id FOREIGN KEY (quiz_id) REFERENCES quiz(id) ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX quiz_taking_user_email_idx ON quiz_taking(user_email);

CREATE TABLE leaderboard
(
    quiz_id     UUID PRIMARY KEY NOT NULL,
    content     JSON NOT NULL,
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_leaderboard_quiz_id FOREIGN KEY (quiz_id) REFERENCES quiz(id) ON UPDATE CASCADE ON DELETE CASCADE
);
