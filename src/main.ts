import {ApiPromise, WsProvider} from '@polkadot/api';
import {startCommand} from './args';
import {LoggerSingleton} from './logger';

async function main() {
    startCommand
        .action(async (options) => {
            LoggerSingleton.setInstance(options.logLevel);
            const logger = LoggerSingleton.getInstance();
            const wsProvider = new WsProvider(options.endpoint);
            const api = await ApiPromise.create({provider: wsProvider});
            logger.info(api.genesisHash.toHex());
            await api.disconnect();
        })
        .parse(process.argv);
}

main();
