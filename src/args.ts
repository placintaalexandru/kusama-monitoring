import assert from "assert";
import {LoggerSingleton} from "./logger";

interface AccountThreshold {
    id: string,
    threshold: number
}

interface PgCredentials {
    host: string,
    port: number,
    user: string,
    password: string,
    database: string,
    table: string
}

interface ServiceConfig {
    logLevel: string,
    port: number,
    endPoint: string
}

interface WatcherConfig {
    serviceConfig: ServiceConfig,
    dbConfig: PgCredentials,
    accounts: Array<AccountThreshold>,
}

const logger = LoggerSingleton.getInstance()

const parseDBConfig = () => {
    const env = process.env;
    const port = parseInt(env.DB_PORT || "", 10);

    assert(port > 0, `"DB_PORT" invalid. "${env.DB_PORT}" could not be parsed. Got: ${port}`);
    assert(env.DB_HOST, `"DB_HOST" must be specified`);
    assert(env.DB_USER, `"DB_USER" must be specified`);
    assert(env.DB_DATABASE, `"DB_DATABASE" must be specified`);
    assert(env.DB_TABLE, `"DB_TABLE" must be specified`);

    return <PgCredentials> {
        host: env.DB_HOST,
        port: port,
        user: env.DB_USER,
        password: env.DB_PASSWORD || "",
        database: env.DB_DATABASE,
        table: env.DB_TABLE
    }
}

const parseServiceConfig = () => {
    const env = process.env;

    const port = parseInt(env.SERVICE_PORT || "", 10);
    assert(port > 0, `"SERVICE_PORT" "${env.SERVICE_PORT}" could not be parsed. Got: ${port}`);

    const endPoint = env.ENDPOINT || "";
    assert(endPoint.length > 0, `"ENDPOINT" ${env.ENDPOINT} is not valid. Got ${endPoint}`);

    return <ServiceConfig> {
        logLevel: env.LOG_LEVEL || "INFO",
        port: port,
        endPoint: endPoint
    }
}

const parseAccountsConfig = () => {
    const env = process.env;
    const rawAccounts: AccountThreshold[] = JSON.parse(env.ACCOUNTS || "[]");
    const accounts: AccountThreshold[] = [];

    rawAccounts.forEach((account) => {
        if (account.threshold <= 0) {
            logger.error(`Expected positive threshold for account ${account.id}. Got: ${account.threshold}`);
        } else {
            accounts.push(account);
        }
    });

    if (accounts.length === 0) {
        logger.warn("No account is being monitored");
    }

    return accounts
}

export const loadConfig = ()  => {
    return <WatcherConfig> {
        serviceConfig: parseServiceConfig(),
        dbConfig: parseDBConfig(),
        accounts: parseAccountsConfig()
    }
};
