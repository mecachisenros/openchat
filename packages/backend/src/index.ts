import { handle } from "hono/aws-lambda";

import { auth } from "./auth";
import api from "./api";

auth.route("/", api);

export const handler = handle(auth);
