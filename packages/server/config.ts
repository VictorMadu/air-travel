import dotenv from "dotenv";
import { Dialect } from "sequelize";

dotenv.config();

class ConfigImpl implements Config {
    port = +(<string>process.env.PORT);
    host = <string>process.env.HOST;
    stripeKey = <string>process.env.STRIPE_KEY;
    db = {
        name: <string>process.env.DB,
        username: <string>process.env.DB_USERNAME,
        password: <string>process.env.DB_PASSWORD,
        host: <string>process.env.DB_HOST,
        dialect: <Dialect>process.env.DB_DIALECT,
        port: +(<string>process.env.DB_PORT),
    };
    weatherServiceAPIKey = <string>process.env.WEATHER_SERVICE_API_KEY;
}

const config = new ConfigImpl();

export interface Config {
    port: number;
    host: string;
    stripeKey: string;
    db: {
        name: string;
        username: string;
        password: string;
        host: string;
        dialect: Dialect;
        port: number;
    };
    weatherServiceAPIKey: string;
}

export default config;
