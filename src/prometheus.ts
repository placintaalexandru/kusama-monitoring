import * as promClient from 'prom-client';
import {Logger, LoggerSingleton} from './logger';
import {PrometheusClient} from './types';

export class Prometheus implements PrometheusClient {
    private statuses: promClient.Gauge;
    private balances: promClient.Gauge;
    private readonly logger: Logger;

    constructor() {
        this.statuses = new promClient.Gauge({
            name: 'statuses',
            help: 'Account under threshold (0 - false; 1 - true)',
            labelNames: ['account_id'],
        });
        this.balances = new promClient.Gauge({
            name: 'balances',
            help: 'Account balance',
            labelNames: ['account_id'],
        });
        this.logger = LoggerSingleton.getInstance();
    }

    startCollection() {
        promClient.collectDefaultMetrics();
        this.logger.info('Starting Prometheus available @ /metrics');
    }

    setBalance(accountId: string, money: number) {
        this.balances.labels(accountId).set(money);
    }

    setStatus(accountId: string, status: boolean) {
        this.statuses.labels(accountId).set(status ? 1 : 0);
    }
}
