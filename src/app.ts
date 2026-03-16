import "reflect-metadata";
import express, { Application, Request, Response, NextFunction } from "express";
import logger from "./config/logger";
import connectDatabase from "./postgresDB/pgService";
import envConfig from "./config/envConfig";

import "./models/index";
import routes from "./routes/index";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use("/api", routes);

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    app.listen(envConfig.port, () => {
      logger.info(`Server running on port ${envConfig.port}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();