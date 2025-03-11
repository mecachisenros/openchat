export const vpc = new sst.aws.Vpc("Vpc", {
  bastion: true,
  nat: "ec2",
});

export const db = new sst.aws.Postgres("Postgres", {
  vpc,
});

export const dbConnectionString = $interpolate`postgresql://${db.username}:${db.password}@${db.host}/${db.database}`;

new command.local.Command(
  "DrizzlePush",
  {
    dir: process.cwd() + "/packages/db",
    create: "sst shell -- drizzle-kit push",
    triggers: [Date.now()],
  },
  {
    dependsOn: [db],
  },
);
