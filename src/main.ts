import {startCommand} from './args';
import {LoggerSingleton} from './logger';
import {Server} from './server';

async function main() {
    startCommand
        .action(async options => {
            LoggerSingleton.setInstance(options.logLevel);
            await new Server().connect(options);
        })
        .parse(process.argv);
}

main().then();
