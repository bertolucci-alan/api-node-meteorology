import './util/module-alias';
import { Server } from '@overnightjs/core';
import bodyParser from 'body-parser';
import { ForecastController } from './controllers/ForecastController';
import { Application } from 'express';
import * as database from '@src/database';
import { BeachController } from './controllers/BeachController';
import { UserController } from './controllers/UserController';

export class SetupServer extends Server {
  constructor(private port = 3333) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupControllers();
    await this.databaseSetup();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    const beachController = new BeachController();
    const userController = new UserController();
    this.addControllers([forecastController, beachController, userController]);
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  public async close(): Promise<void> {
    await database.close();
  }

  public getApp(): Application {
    return this.app;
  }

  public start(): void {
    this.app.listen(this.port, () =>
      console.info(`Server is running at localhost:${this.port}`)
    );
  }
}
