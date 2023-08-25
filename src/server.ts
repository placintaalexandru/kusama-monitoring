import express from 'express';
import {OptionValues} from 'commander';
import {Logger, LoggerSingleton} from './logger';
import {register} from 'prom-client';
import {Client} from './client';
import {Prometheus} from './prometheus';
import {ApiPromise} from '@polkadot/api';
import * as http from 'http';
import {Listener} from './listener';
import {PgClient} from './db';

const health = async (_: express.Request, res: express.Response) => {
    res.status(200).send('OK!');
};

const metrics = async (_req: express.Request, res: express.Response) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
};

export class Server {
    private api: ApiPromise | undefined;
    private server: http.Server | undefined;
    private readonly prometheus: Prometheus;
    private readonly logger: Logger;

    constructor() {
        this.logger = LoggerSingleton.getInstance();
        this.prometheus = new Prometheus();
    }

    public async connect(opts: OptionValues): Promise<Server> {
        await new Client(opts).connect().then(async api => {
            this.api = api;

            this.server = express()
                .get('/health', health)
                .get('/metrics', metrics)
                .listen(opts.service_port)
                .on('error', err => {
                    throw err;
                });

            this.logger.info(`Server started on port ${opts.service_port}`);
            this.prometheus.startCollection();

            await new Listener(this.api, this.prometheus, new PgClient(opts)).subscribe(
                opts.accounts
            );
        });

        return this;
    }

    public async disconnect() {
        this.server?.close(async err => {
            this.logger.info('Server shutting down');

            if (err) {
                this.logger.error(err.toString());
            }

            await this.api?.disconnect().then(() => {
                this.logger.info('API disconnected');
            });
        });
    }
}
