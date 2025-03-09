import { handle } from "hono/aws-lambda";

import { auth } from "./auth";

export const handler = handle(auth);
