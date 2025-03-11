/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "OpenChat",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          region: "eu-west-1",
        },
        command: "1.0.2",
      },
    };
  },
  async run() {
    await import("./infra/db");
    await import("./infra/api");
    await import("./infra/zero");
    await import("./infra/frontend");
  },
});
