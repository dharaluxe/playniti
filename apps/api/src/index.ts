import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import { createClient } from "@supabase/supabase-js";
import { registerRoutes } from "./routes.js";
import * as dotenv from "dotenv";
dotenv.config();

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });
await app.register(swagger, {
  openapi: {
    openapi: "3.1.0",
    info: { title: "Playniti API", version: "1.0.0" }
  },
  routePrefix: "/docs",
  exposeRoute: true
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL||"",
  process.env.SUPABASE_SERVICE_ROLE_KEY||""
);

app.decorate("supabase", supabase);

registerRoutes(app);

const port = parseInt(process.env.API_PORT||"4000");
app.listen({ port, host: "0.0.0.0" }).catch(err => {
  app.log.error(err);
  process.exit(1);
});
