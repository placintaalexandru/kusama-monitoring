import express from 'express';
import {OptionValues} from 'commander';
import {Logger, LoggerSingleton} from './logger';
import {register} from 'prom-client';
import {Client} from './client';
import {Prometheus} from './prometheus';
import * as http from 'http';
import {Listener} from './listener';
import {PgClient} from './db';
import { StatusCode } from 'status-code-enum'

const health = async (_: express.Request, res: express.Response) => {
    res.status(StatusCode.SuccessOK).send('OK!');
};

const metrics = async (_req: express.Request, res: express.Response) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
};

const readiness = (pool: PgClient) => {
    return async (_req: express.Request, res: express.Response) => {
        const dbReady = await pool.ready();

        if (dbReady) {
            res.status(StatusCode.SuccessOK).send('OK');
        } else {
            res.status(StatusCode.ServerErrorServiceUnavailable).send('NOT OK');
        }
    }
}

export class Server {
    private server: http.Server | undefined;
    private listener: Listener | undefined;

    private readonly logger: Logger;

    constructor() {
        this.logger = LoggerSingleton.getInstance();
    }

    public async connect(opts: OptionValues): Promise<Server> {
        await new Client(opts).connect().then(async api => {
            const pgClient = new PgClient(opts);

            this.server = express()
                .get('/health', health)
                .get('/metrics', metrics)
                .get('/readiness', readiness(pgClient))
                .listen(opts.service_port)
                .on('error', err => {
                    throw err;
                });

            this.logger.info(`Server started on port ${opts.service_port}`);

            const prometheus = new Prometheus();
            prometheus.startCollection();

            this.listener = new Listener(api, prometheus, pgClient);
            await this.listener.subscribe(opts.accounts);
        });

        return this;
    }

    public async disconnect() {
        await this.listener?.disconnect();
        this.server?.close(async err => {
            if (err) {
                throw err;
            }
        });

        this.logger.info('Server shut down');
    }
}
