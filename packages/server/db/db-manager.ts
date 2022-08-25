import { Sequelize } from "sequelize";
import mysql from "mysql2/promise";
import { Config } from "../config";
import { QueryResult, DBInitializer, DbQuerier, QueryCreator, Result } from "./db-manager.types";
import NonExistingTablesCreator from "./mysql-non-existing-tables-creator";

export default class DbManager implements DBInitializer, DbQuerier {
    private db!: Sequelize;

    constructor(
        private config: Config,
        private nonExistingTablesCreator: NonExistingTablesCreator
    ) {}

    async init() {
        await this.createDbIfNotExist();
        await this.connectDb();
        await this.nonExistingTablesCreator.createTables(this);
    }

    // TODO: Make sequelize type better
    async query<T extends QueryResult>(queryCreator: QueryCreator) {
        console.log("QUERY QUERY QUERY", queryCreator.getQuery());
        const result = await (<Promise<any>>this.db.query(queryCreator.getQuery()));
        console.log("QUERY QUERY RESULT", result);

        return result;
    }

    private async createDbIfNotExist() {
        const connection = await mysql.createConnection({
            user: this.config.db.username,
            host: this.config.db.host,
            password: this.config.db.password,
        });
        return connection.query(`CREATE DATABASE IF NOT EXISTS \`${this.config.db.name}\`;`);
    }

    private connectDb() {
        const dbConfig = this.config.db;
        this.db = new Sequelize(dbConfig.name, dbConfig.username, dbConfig.password, {
            host: dbConfig.host,
            dialect: dbConfig.dialect,
            dialectOptions: {
                multipleStatements: true,
            },
        });
        return this.db.authenticate();
    }
}
