import { vpc } from "./vpc";
import { frontend } from "./frontend";
import { awsZone } from "./secrets";
import subdomains from "./subdomains";

export const api = new sst.aws.Auth("Api", {
  forceUpgrade: "v2",
  domain: {
    name: subdomains.api,
    dns: sst.aws.dns({ zone: awsZone.value }),
  },
  issuer: {
    handler: "packages/functions/src/api.handler",
    vpc,
    link: [frontend],
  },
});
