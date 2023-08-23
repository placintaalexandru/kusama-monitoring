import {ApiPromise} from '@polkadot/api';
import {AccountThreshold} from './args';
import {Prometheus} from './prometheus';
import {Logger, LoggerSingleton} from './logger';
import {formatBalance} from '@polkadot/util';

export class Listener {
    private readonly api: ApiPromise;
    private readonly prometheus: Prometheus;
    private readonly logger: Logger;

    constructor(api: ApiPromise, prometheus: Prometheus) {
        this.api = api;
        this.prometheus = prometheus;
        this.logger = LoggerSingleton.getInstance();
    }

    public async subscribe(accounts: AccountThreshold[]) {
        accounts.forEach(account => {
            this.api.query.system.account(
                account.id,
                // {data: {free: currentFree}, nonce: _}
                (codec: any) => {
                    const readableBalance = parseFloat(
                        formatBalance(codec.data.free, {withSi: false})
                    );

                    this.prometheus.setStatus(
                        account.id,
                        readableBalance < account.threshold
                    );
                    this.prometheus.setBalance(account.id, readableBalance);

                    this.logger.info(`Subscribed to account ${account.id}`);
                }
            );
        });
    }
}
