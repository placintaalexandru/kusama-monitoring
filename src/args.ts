import assert from 'assert';
import {LoggerSingleton} from './logger';
import {Option, Command} from 'commander';

interface AccountThreshold {
    id: string;
    threshold: number;
}

const logger = LoggerSingleton.getInstance();

const parseAccounts = (argValue: string) => {
    const rawAccounts: AccountThreshold[] = JSON.parse(argValue);
    const accounts: AccountThreshold[] = [];

    rawAccounts.forEach(account => {
        if (account.threshold <= 0) {
            logger.error(
                `Expected positive threshold for account ${account.id}. Got: ${account.threshold}`
            );
        } else {
            accounts.push(account);
        }
    });

    if (accounts.length === 0) {
        logger.warn('No account is being monitored');
    }

    return accounts;
};

const validatePort = (argValue: string) => {
    const port = parseInt(argValue, 10);
    assert(port > 0, `Invalid port number ${port}`);
    return port;
};

export const startCommand = new Command('start')
    .description('Starts the watcher')
    .allowUnknownOption(false)
    .addOption(
        new Option('-l, --logLevel <level>', 'Log level')
            .default('INFO')
            .env('LOG_LEVEL')
    )
    .addOption(
        new Option('-p, --service_port <port>', 'Port number')
            .env('SERVICE_PORT')
            .argParser(validatePort)
    )
    .addOption(
        new Option('-e, --endpoint <endpoint>', 'Chain used')
            .env('ENDPOINT')
            .makeOptionMandatory(true)
    )
    .addOption(
        new Option('--pg_host [host]', 'Address of the PostgreSQL database')
            .env('PG_HOST')
            .default('localhost')
    )
    .addOption(
        new Option('--pg_port [port]', 'Port of the PostgreSQL database')
            .env('PG_PORT')
            .default('5555')
            .argParser(validatePort)
    )
    .addOption(
        new Option('--pg_user [user]', 'User of the PostgreSQL database')
            .env('PG_USER')
            .makeOptionMandatory(true)
    )
    .addOption(
        new Option('--pg_password [password]', 'Password for the user')
            .env('PG_PASSWORD')
            .makeOptionMandatory(true)
    )
    .addOption(
        new Option('--pg_database [database]', 'Name of the database')
            .env('PG_DATABASE')
            .makeOptionMandatory(true)
    )
    .addOption(
        new Option('--pg_table [table]', 'Name of the table')
            .env('PG_TABLE')
            .makeOptionMandatory(true)
    )
    .addOption(
        new Option(
            '--accounts [accounts]',
            'Accounts to monitor as JSON string'
        )
            .env('ACCOUNTS')
            .makeOptionMandatory(true)
            .argParser(parseAccounts)
    );
