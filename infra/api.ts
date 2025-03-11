import { vpc, db } from "./db";
import { frontend } from "./frontend";
import { awsHostedZone, groqApiKey } from "./secrets";
import subdomains from "./subdomains";

export const api = new sst.aws.Auth("Api", {
  forceUpgrade: "v2",
  domain: {
    name: subdomains.api,
    dns: sst.aws.dns({ zone: awsHostedZone.value }),
  },
  issuer: {
    handler: "packages/backend/src/index.handler",
    vpc,
    link: [db, frontend, groqApiKey],
    environment: {
      AUTH_URL: $interpolate`https://${subdomains.api}`,
    },
  },
});
