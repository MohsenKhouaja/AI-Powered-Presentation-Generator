-- delete in prod
DROP TABLE IF EXISTS slides;

DROP TABLE IF EXISTS presentations;

DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
);

CREATE TABLE IF NOT EXISTS presentations (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
);

CREATE TABLE IF NOT EXISTS slides (
    id VARCHAR(255) PRIMARY KEY,
    content TEXT NOT NULL,
    presentation_id VARCHAR(255) NOT NULL,
    slide_order INT NOT NULL,
    presentation_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (presentation_id) REFERENCES presentations (id) ON DELETE CASCADE,
);

CREATE TABLE IF NOT EXISTS contexts (
    id VARCHAR(255) PRIMARY KEY,
    prompt TEXT,
    presentation_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (presentation_id) REFERENCES presentations (id) ON DELETE CASCADE,
);

CREATE TABLE IF NOT EXISTS files (
    id VARCHAR(255) PRIMARY KEY,
    KEY VARCHAR(255) NOT NULL,
    FOREIGN KEY context_id REFERENCES contexts (id) ON DELETE CASCADE,
    storage_key TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
);

CREATE TABLE IF NOT EXISTS presentations_access (
    id VARCHAR(255) PRIMARY KEY,
    KEY VARCHAR(255) NOT NULL,
    FOREIGN KEY user_id REFERENCES users (id) ON DELETE CASCADE,
    presentation_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (presentation_id) REFERENCES presentations (id) ON DELETE CASCADE,
    access_type ENUM('edit', 'view') NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    CONSTRAINT uq_slide_position UNIQUE (presentation_id, slide_order),
);