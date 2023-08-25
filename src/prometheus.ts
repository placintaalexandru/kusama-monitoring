import * as promClient from 'prom-client';
import {Logger, LoggerSingleton} from './logger';
import {AccountThreshold} from "./args";

export interface PrometheusClient {
    /**
     * Sets the status of the account (under or not the threshold)
     * @param accountId Account
     * @param status True if the account is under the threshold, false otherwise
     */
    setStatus(accountId: string, status: boolean): void;

    /**
     * Sets the status (under or not the threshold)
     * @param accountId Account
     * @param money Amount that the account holds
     */
    setBalance(accountId: string, money: number): void;
}

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
        this.logger.info('Starting Prometheus available @ /metrics');
        promClient.collectDefaultMetrics();
    }

    setBalance(accountId: string, money: number) {
        this.balances.labels(accountId).set(money);
    }

    setStatus(accountId: string, status: boolean) {
        this.statuses.labels(accountId).set(status ? 1 : 0);
    }
}
