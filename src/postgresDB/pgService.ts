import sequelize from "./pgConfig";
import logger from "../config/logger";

const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info("Database connection established successfully");

    await sequelize.sync({ alter: false });
    logger.info("Database synced successfully");
  } catch (error) {
    logger.error("Unable to connect to the database", error);
    process.exit(1);
  }
};

export default connectDatabase;