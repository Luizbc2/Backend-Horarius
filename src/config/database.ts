import { Sequelize } from "sequelize";

import { env } from "./env";

class Database {
  private sequelize: Sequelize | null = null;

  public isConfigured(): boolean {
    const { host, name, user, password } = env.database;

    return Boolean(host && name && user && password);
  }

  public getConnection(): Sequelize {
    if (!this.sequelize) {
      this.sequelize = new Sequelize(env.database.name, env.database.user, env.database.password, {
        host: env.database.host,
        port: env.database.port,
        dialect: "postgres",
        logging: false
      });
    }

    return this.sequelize;
  }

  public async connect(): Promise<void> {
    if (!this.isConfigured()) {
      console.log("Database connection skipped: configure PostgreSQL variables when ready.");
      return;
    }

    await this.getConnection().authenticate();
    console.log("Database connection established.");
  }
}

export const database = new Database();
