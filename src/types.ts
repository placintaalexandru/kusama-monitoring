export interface PrometheusClient {
    /**
     * Sets the status of the account (under or not the threshold)
     * @param accountId Account
     * @param status True if the account is under the threshold, false otherwise
     */
    setStatus(accountId: string, status: boolean): void;

    /**
     * Sets the status (under or not the threshold)
     * @param accountId Account
     * @param money Amount that the account holds
     */
    setBalance(accountId: string, money: number): void;
}

export interface DatabaseClient {
    /**
     * Updates the status of te account with the given status and the data when it changed
     * @param accountId Account
     * @param timestamp Timestamp (milliseconds) when the balance change occurred
     */
    setStatus(accountId: string, timestamp: number): Promise<void>;

    /**
     * Closes the connection.
     */
    end(): Promise<void>;
}
