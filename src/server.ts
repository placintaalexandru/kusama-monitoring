import express from 'express';
import {OptionValues} from 'commander';
import {Logger, LoggerSingleton} from './logger';
import {register} from 'prom-client';
import {Client} from './client';
import {Prometheus} from './prometheus';
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
    private server: http.Server | undefined;
    private listener: Listener | undefined;

    private readonly logger: Logger;

    constructor() {
        this.logger = LoggerSingleton.getInstance();
    }

    public async connect(opts: OptionValues): Promise<Server> {
        await new Client(opts).connect().then(async api => {
            this.server = express()
                .get('/health', health)
                .get('/metrics', metrics)
                .listen(opts.service_port)
                .on('error', err => {
                    throw err;
                });

            this.logger.info(`Server started on port ${opts.service_port}`);

            const prometheus = new Prometheus();
            prometheus.startCollection();

            this.listener = new Listener(api, prometheus, new PgClient(opts));
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
