import {Pool} from 'pg';
import {LoggerSingleton, Logger} from './logger';
import {OptionValues} from 'commander';
import {DatabaseClient} from './types';

export class PgClient implements DatabaseClient {
    private readonly logger: Logger;
    private readonly table: string;
    private readonly pgPool: Pool;

    constructor(opts: OptionValues) {
        this.logger = LoggerSingleton.getInstance();
        this.table = opts.pg_table;
        this.pgPool = new Pool({
            user: opts.pg_user,
            host: opts.pg_host,
            port: opts.pg_port,
            database: opts.pg_database,
            password: opts.pg_password,
        }).on('error', err => {
            this.logger.error(err.toString());
        });
    }

    async ready(): Promise<boolean> {
        return this.pgPool.connect().then(async client => {
            const result = await client.query(
                `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${this.table}'`
            ).then(queryResult => {
                return queryResult.rows.length === 1;
            }).catch(err => {
                this.logger.error(err.toString());
                return false;
            });

            client.release();

            return result;
        }).catch(err => {
            console.log(err.toString());
            return false;
        });
    }

    async setStatus(accountId: string, timestamp: number) {
        const connection = await this.pgPool.connect();

        try {
            await connection.query(
                `INSERT INTO ${this.table} (id, event_time) VALUES ($1, $2)`,
                [accountId, timestamp]
            );
        } finally {
            // This must always be called to return the connection back to the pool
            connection.release();
        }
    }

    async end() {
        await this.pgPool.end();
    }
}
