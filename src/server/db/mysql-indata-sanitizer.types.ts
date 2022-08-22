export interface MySQLInDataSanitizer {
    sanitizeStr(v: string | NullyInData): string;
    sanitizeNum(v: number | NullyInData): string;
    sanitizeBool(v: boolean | NullyInData): string;
    sanitizeSearchText(v: string | NullyInData): string;
}

export type InData = NonNullyInData | NullyInData;
export type NonNullyInData = string | number | boolean;
export type NullyInData = null | undefined;
