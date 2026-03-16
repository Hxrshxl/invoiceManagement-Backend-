import { Sequelize } from "sequelize";
import envConfig from "../config/envConfig";

const sequelize = new Sequelize(
  envConfig.db.name,
  envConfig.db.user,
  envConfig.db.password,
  {
    host: envConfig.db.host,
    port: envConfig.db.port,
    dialect: "postgres",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export default sequelize;