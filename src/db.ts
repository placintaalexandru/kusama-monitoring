import {Pool} from 'pg';
import {LoggerSingleton, Logger} from './logger';
import {OptionValues} from 'commander';

export interface DatabaseClient {
    /**
     * Updates the status of te account with the given status and the data when it changed
     * @param accountId Account
     * @param timestamp Date
     */
    setStatus(accountId: string, timestamp: number): Promise<void>;

    end(): Promise<void>;
}

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

    async setStatus(accountId: string, timestamp: number) {
        const connection = await this.pgPool.connect();

        try {
            await connection.query(
                `INSERT INTO ${this.table} (id, event_time) VALUES ($1, $2)`,
                [accountId, timestamp]
            );
        } catch (err: any) {
            throw err;
        } finally {
            // This must always be called to return the connection back to the pool
            connection.release();
        }
    }

    async end() {
        await this.pgPool.end()
    }
}
