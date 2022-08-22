export interface DBInitializer {
    init(): Promise<void>;
}

export interface DbQuerier {
    query<T extends QueryResult>(queryCreator: QueryCreator): Promise<Result<T>>;
}

export interface QueryCreator {
    getQuery(): string;
}

type OutData = string | number | boolean | null;

export interface ResultSetHeader {
    fieldCount: number;
    affectedRows: number;
    insertId: number;
    info: string;
    serverStatus: number;
    warningStatus: number;
}

type FieldCount = number; // TODO: I guessed its fieldCount
type AffectedRows = number;

export type Row = OutData[];
export type InsertResult = [FieldCount, AffectedRows];
export type QueryResult = Row | ResultSetHeader | InsertResult;

export type Result<T extends QueryResult> = T extends Row
    ? [T[], ResultSetHeader]
    : T extends ResultSetHeader
    ? [ResultSetHeader, ResultSetHeader]
    : T extends number
    ? InsertResult
    : never;
