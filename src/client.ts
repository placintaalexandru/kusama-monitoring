import { ApiPromise, WsProvider } from '@polkadot/api';
import { LoggerSingleton, Logger } from './logger';
import {OptionValues} from 'commander';

export class Client {
    private api: ApiPromise | undefined;
    private readonly endpoint: string;
    private readonly logger: Logger = LoggerSingleton.getInstance();

    constructor(opts: OptionValues) {
        this.endpoint = opts.endpoint;
    }

    public async connect(): Promise<ApiPromise> {
        this.api = await ApiPromise.create({provider: new WsProvider(this.endpoint)});
        const [chain, nodeName, nodeVersion] = await Promise.all([
            this.api.rpc.system.chain(),
            this.api.rpc.system.name(),
            this.api.rpc.system.version()
        ]);
        this.logger.info(
            `Client connected to chain ${chain} using ${nodeName} v${nodeVersion}`
        );

        return this.api;
    }
}
