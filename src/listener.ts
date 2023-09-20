import {ApiPromise} from '@polkadot/api';
import {AccountThreshold} from './args';
import {Logger, LoggerSingleton} from './logger';
import {BN} from '@polkadot/util';
import {DatabaseClient, PrometheusClient} from './types';
import { AccountInfoWithTripleRefCount } from '@polkadot/types/interfaces/system';
import {parseBalance} from "./util";

export class Listener {
    private readonly api: ApiPromise;
    private readonly prometheus: PrometheusClient;
    private readonly logger: Logger;
    private readonly client: DatabaseClient;
    private readonly base: BN;

    constructor(
        api: ApiPromise,
        prometheus: PrometheusClient,
        dbClient: DatabaseClient
    ) {
        this.prometheus = prometheus;
        this.logger = LoggerSingleton.getInstance();
        this.client = dbClient;
        this.api = api;
        this.base = new BN(10).pow(new BN(this.api.registry.chainDecimals));
    }

    public async subscribe(accounts: AccountThreshold[]) {
        accounts.forEach(account => {
            this.api.query.system.account(
                account.id,
                async (accountInfo: AccountInfoWithTripleRefCount) => {
                    const readableBalance = parseBalance(accountInfo.data.free, this.base);
                    const status = readableBalance < account.threshold;
                    const timestamp = await this.api.query.timestamp.now();

                    if (status) {
                        try {
                            const t = parseInt(timestamp.toString(), 10);
                            await this.client.setStatus(account.id, t);
                        } catch (err: any) {
                            this.logger.error(
                                `Error updating status in database: ${err.toString()}`
                            );
                        }
                    }

                    this.prometheus.setStatus(account.id, status);
                    this.prometheus.setBalance(account.id, readableBalance);

                    this.logger.info(`Subscribed to account ${account.id}`);
                }
            );
        });
    }

    public async disconnect() {
        await this.api.disconnect();
        await this.client.end().then(() => {
            this.logger.info('Database connection closed');
        });
    }
}
