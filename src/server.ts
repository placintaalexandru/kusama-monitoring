import express from 'express';
import {OptionValues} from 'commander';
import {LoggerSingleton} from './logger';
import {register} from 'prom-client';
import {Client} from './client';
import {Prometheus} from './prometheus';

const health = async (_: express.Request, res: express.Response) => {
    res.status(200).send('OK!');
};

const metrics = async (_req: express.Request, res: express.Response) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
};

export const startServer = async (opts: OptionValues) => {
    const logger = LoggerSingleton.getInstance();
    const server = express().get('/health', health).get('/metrics', metrics);

    server.listen(opts.service_port);
    logger.info(`Server started on port ${opts.service_port}`);

    const api = await new Client(opts).connect();

    const promClient = new Prometheus();
    promClient.startCollection();

    return server;
};
