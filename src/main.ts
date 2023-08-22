import {startCommand} from './args';
import {LoggerSingleton} from './logger';
import {startServer} from './server';

async function main() {
    startCommand
        .action(async options => {
            LoggerSingleton.setInstance(options.logLevel);
            await startServer(options);
        })
        .parse(process.argv);
}

main().then();
