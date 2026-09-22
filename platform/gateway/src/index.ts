import { handleGateway } from "./handler";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handleGateway(request, env);
  },
} satisfies ExportedHandler<Env>;
