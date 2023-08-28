# kusama-monitoring

## 1. Deploy

### 1. Docker compose

#### Prerequisites:
- docker compose v2

#### Deploy:

To deploy the application, the following environment variables need to be set:
- ENDPOINT: the chain that will be monitored
- PG_USER: the username that the chain watcher will use to insert data in the 
Postgres database
- PG_PASSWORD: the password associated with the above user (**the user and the password
will be automatically created in Postgres**)
- LOG_LEVEL: the watcher's log level
- ACCOUNTS: a JSON object encoded as a string

The following example deploys the application with a debug log leve to monitor the 
`wss://westend-rpc.polkadot.io` chain, creates in Postgres the username and password 
`postgres`:
```sh
ENDPOINT=wss://westend-rpc.polkadot.io \
PG_USER=postgres \
PG_PASSWORD=postgres \
LOG_LEVEL=debug \
ACCOUNTS='[{"id": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", "threshold": 1.2}, {"id": "5H
WToYXcfJHg8kJzZgDuPtcUFJm7ftPWoaMT6e3QoAigwE1V", "threshold": 9.9842}]' \
docker-compose up --build --force-recreate
```

The accounts that are being monitored are

```json
[
  {
    "id": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", 
    "threshold": 1.2
  }, 
  {
    "id": "5HWToYXcfJHg8kJzZgDuPtcUFJm7ftPWoaMT6e3QoAigwE1V", 
    "threshold": 9.9842
  }
]
```

After deployment, the Postgres database data will be available on `./data` directory.

### 2. Helm

To deploy the application via helm run (**the template name is important as it
is used in the prometheus scrape config**). This will deploy only with an account
to be monitored:
```sh
helm install --name-template watcher ./helm
```


To tweak the accounts that are being monitored, set the `accounts` variable
from the helm's `values.yaml` file and redeploy:
```sh
helm install --name-template watcher ./helm \
--set
--set "accounts[0].id=<ID_0>,accounts[0].threshold=<THRESHOLD_0>" \
--set "accounts[1].id=<ID_1>,accounts[1].threshold=<THRESHOLD_1>" \
...
--set "accounts[N].id=<ID_N>,accounts[1].threshold=<THRESHOLD_N>"
```

#### Limitations

1. Some events might not be recorded in the Postgres database at the beginning
until the database and the table are created (need a readiness probe to detect
when the database and table are created).
2. Since the release name is fixed, the chart needs to be uninstalled before
being reinstalled (**some secrets and configmap need to be manually removed**).
