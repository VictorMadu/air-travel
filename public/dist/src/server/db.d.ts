declare class Db {
    private static sequelize;
    static init(): Promise<void>;
    static query(queryString: string): Promise<[unknown[], unknown]>;
    static createAirportTable(): void;
}
export default Db;
