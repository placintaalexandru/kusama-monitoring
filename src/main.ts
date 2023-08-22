import {ApiPromise, WsProvider} from '@polkadot/api';
import {loadConfig} from "./args";

async function main() {
    const config = loadConfig();
    console.log(config);

    const wsProvider = new WsProvider(config.serviceConfig.endPoint);
    const api = await ApiPromise.create({ provider: wsProvider });
    console.log(api.genesisHash.toHex());
    await api.disconnect();
}

main();
