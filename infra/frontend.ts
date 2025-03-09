import { awsZone } from "./secrets";
import subdomains from "./subdomains";

export const frontend = new sst.aws.StaticSite("zchat", {
  path: "packages/frontend",
  domain: {
    name: subdomains.chat,
    dns: sst.aws.dns({ zone: awsZone.value }),
  },
  build: {
    command: "pnpm build",
    output: "dist",
  },
  environment: {
    PUBLIC_AUTH_URL: subdomains.api,
    PUBLIC_API_URL: $interpolate`${subdomains}/api`,
    PUBLIC_ZERO_URL: subdomains.zero,
  },
});
