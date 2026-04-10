-- delete in prod
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS presentations_access;

DROP TABLE IF EXISTS files;

DROP TABLE IF EXISTS contexts;

DROP TABLE IF EXISTS slides;

DROP TABLE IF EXISTS presentations;

DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS presentations (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS slides (
    id VARCHAR(255) PRIMARY KEY,
    presentation_id VARCHAR(255) NOT NULL,
    slide_order INT NOT NULL,
    FOREIGN KEY (presentation_id) REFERENCES presentations (id) ON DELETE CASCADE,
    --CONSTRAINT uq_slide_position UNIQUE (presentation_id, slide_order)
);

CREATE TABLE IF NOT EXISTS contexts (
    id VARCHAR(255) PRIMARY KEY,
    prompt TEXT DEFAULT "",
    presentation_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (presentation_id) REFERENCES presentations (id) ON DELETE CASCADE,
    CONSTRAINT uq_presentation UNIQUE (presentation_id),
)
CREATE TABLE IF NOT EXISTS files (
    id VARCHAR(255) PRIMARY KEY,
    context_id VARCHAR(255) NOT NULL,
    storage_key TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    FOREIGN KEY (context_id) REFERENCES contexts (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS edit_access (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    presentation_id VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (presentation_id) REFERENCES presentations (id) ON DELETE CASCADE,
    CONSTRAINT uq UNIQUE (user_id, presentation_id)
);