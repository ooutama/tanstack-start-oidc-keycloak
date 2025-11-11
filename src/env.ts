import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    PUBLIC_URL: z.string().url().nonempty({ message: "PUBLIC_URL is required" }),

    IDP_URL: z.string().url().nonempty({ message: "IDP_URL is required" }),
    IDP_CLIENT_ID: z.string().nonempty({ message: "IDP_CLIENT_ID is required" }),
    IDP_CLIENT_SECRET: z.string().nonempty({ message: "IDP_CLIENT_SECRET is required" }),

    SESSION_SECRET: z.string().nonempty({ message: "SESSION_SECRET is required" }),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
