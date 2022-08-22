import { Dialect } from "sequelize";
export default class Config {
    static port: number;
    static host: string;
    static db: {
        name: string;
        username: string;
        password: string;
        host: string;
        dialect: Dialect;
        port: number;
    };
}
