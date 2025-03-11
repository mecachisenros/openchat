import { awsHostedZone } from "./secrets";
import subdomains from "./subdomains";

export const frontend = new sst.aws.StaticSite("OpenChat", {
  path: "packages/frontend",
  domain: {
    name: subdomains.chat,
    dns: sst.aws.dns({ zone: awsHostedZone.value }),
  },
  build: {
    command: "pnpm build",
    output: "dist",
  },
  environment: {
    VITE_AUTH_URL: $interpolate`https://${subdomains.api}`,
    VITE_API_URL: $interpolate`https://${subdomains.api}/api`,
    VITE_ZERO_URL: $interpolate`https://${subdomains.zero}`,
  },
});
