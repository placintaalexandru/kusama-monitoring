SELECT 'CREATE DATABASE accounts'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'accounts')\gexec
