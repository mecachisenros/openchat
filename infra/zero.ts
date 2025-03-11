import { vpc, db, dbConnectionString } from "./db";
import { awsHostedZone } from "./secrets";
import subdomains from "./subdomains";

const cluster = new sst.aws.Cluster("Cluster", { vpc, forceUpgrade: "v2" });

export const zero = new sst.aws.Service(
  "Zero",
  {
    cluster,
    image: "rocicorp/zero",
    link: [db],
    wait: true,
    environment: {
      ZERO_UPSTREAM_DB: dbConnectionString,
      ZERO_CVR_DB: dbConnectionString,
      ZERO_CHANGE_DB: dbConnectionString,
      ZERO_REPLICA_FILE: "/tmp/zero_replica.db",
      ZERO_NUM_SYNC_WORKERS: "1",
      ZERO_AUTH_JWKS_URL: $interpolate`https://${subdomains.api}/.well-known/jwks.json`,
    },
    loadBalancer: {
      ports: [
        { listen: "443/https", forward: "4848/http" },
        { listen: "80/http", forward: "4848/http" },
      ],
      domain: {
        name: subdomains.zero,
        dns: sst.aws.dns({ zone: awsHostedZone.value }),
      },
    },
    dev: {
      command: "pnpm start",
      directory: "packages/zero",
    },
  },
  { dependsOn: [db] },
);

new command.local.Command(
  "ZeroPermissions",
  {
    dir: process.cwd() + "/packages/zero",
    create: "sst shell -- pnpm permissions",
    triggers: [Date.now()],
    environment: {
      ZERO_UPSTREAM_DB: dbConnectionString,
    },
  },
  {
    dependsOn: [zero],
  },
);
