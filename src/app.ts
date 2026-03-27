import cors from "cors";
import express, { Express } from "express";

import { env } from "./config/env";
import { router } from "./routes";

export class App {
  public readonly server: Express;

  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    this.server.use(
      cors({
        origin: env.frontendUrl
      })
    );
    this.server.use(express.json());
  }

  private routes(): void {
    this.server.use("/api", router);
  }
}
