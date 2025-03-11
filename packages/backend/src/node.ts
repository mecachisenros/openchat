import { serve } from "@hono/node-server";

import { auth } from "./auth";
import api from "./api";

auth.route("/", api);

serve({
  fetch: auth.fetch,
  port: 3000,
});
