import {ApiPromise, WsProvider} from '@polkadot/api';
import {LoggerSingleton, Logger} from './logger';
import {OptionValues} from 'commander';

export class Client {
    private api: ApiPromise | undefined;

    private readonly endpoint: string;
    private readonly logger: Logger;

    constructor(opts: OptionValues) {
        this.endpoint = opts.endpoint;
        this.logger = LoggerSingleton.getInstance();
    }

    public async connect(): Promise<ApiPromise> {
        this.api = (
            await ApiPromise.create({
                provider: new WsProvider(this.endpoint),
            })
        ).on('disconnected', () => {
            this.logger.info('API connection closed');
        });

        const [chain, nodeName, nodeVersion] = await Promise.all([
            this.api.rpc.system.chain(),
            this.api.rpc.system.name(),
            this.api.rpc.system.version(),
        ]);
        this.logger.info(
            `Client connected to chain ${chain} using ${nodeName} v${nodeVersion}`
        );

        return this.api;
    }
}
