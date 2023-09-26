\c accounts;
CREATE TABLE IF NOT EXISTS accounts (
    id text,
    event_time bigint,

    CONSTRAINT pk PRIMARY KEY (id, event_time)
);
