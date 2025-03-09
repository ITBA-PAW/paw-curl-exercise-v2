CREATE TABLE IF NOT EXISTS styles (
                                      id SERIAL PRIMARY KEY,
                                      group_number INTEGER NOT NULL UNIQUE,
                                      style VARCHAR(8192)
)
