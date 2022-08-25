import { MySQLInDataSanitizer, NullyInData } from "./mysql-indata-sanitizer.types";
import { MySQLValue } from "./mysql-value";

export default class MySQLInDataSanitizerImpl implements MySQLInDataSanitizer {
    private sanitizeRegExp = /(['"])/g;
    private unwantedSearchTextRegExp = /[^_0-9A-Za-z\s]/g;
    private unwantedSearchTextSpacesRegExp = /\s+/g;

    constructor(private mySQLValue: MySQLValue) {}

    sanitizeStr(v: string | NullyInData) {
        if (typeof v !== "string") return this.mySQLValue.null;
        return "'" + v.replace(this.sanitizeRegExp, "\\$1") + "'";
    }

    sanitizeNum(v: number | NullyInData) {
        if (typeof v !== "number" || isNaN(v)) return this.mySQLValue.null;
        switch (v) {
            case Number.POSITIVE_INFINITY:
            case Number.NEGATIVE_INFINITY:
            case NaN:
                return this.mySQLValue.null;

            default:
                return v.toString(10);
        }
    }

    sanitizeBool(v: boolean | NullyInData) {
        if (typeof v !== "boolean") return this.mySQLValue.null;
        switch (v) {
            case true:
                return this.mySQLValue.true;
            case false:
            default:
                return this.mySQLValue.false;
        }
    }

    sanitizeSearchText(v: string | NullyInData) {
        if (typeof v !== "string") return "";
        const searchText = v
            .replace(this.unwantedSearchTextRegExp, "")
            .replace(this.unwantedSearchTextSpacesRegExp, " ");
        return this.sanitizeStr(searchText);
    }

    sanitizeOffset(v: number | NullyInData) {
        return this.sanitizeNumOrUseDefault(v, "0");
    }

    sanitizeBatch(v: number | NullyInData) {
        return this.sanitizeNumOrUseDefault(v, "1");
    }

    private sanitizeNumOrUseDefault(v: number | NullyInData, defaultValue: string) {
        const num = this.sanitizeNum(v);
        if (num === this.mySQLValue.null) return defaultValue;
        return num;
    }
}
