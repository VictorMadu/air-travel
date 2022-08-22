import fs from "fs";
import path from "path";
import CsvReadableStream from "csv-reader";
import AutoDetectDecoderStream from "autodetect-decoder-stream";
import { CSVManager, CSVRow, RowTraverser } from "./airport-csv-manager.types";

// TODO: PATTERN Use iterator pattern to iterating rows
export default class AirportCSVManager implements RowTraverser, CSVManager {
    private csvRows = <Record<number, CSVRow>>{};
    private csvHead = -1;
    private totalRows = this.csvHead;
    private csvFilePath = path.join(rootDirectory, "airports.csv");
    private inputStream!: fs.ReadStream;

    getHeads() {
        return <string[]>this.csvRows[this.csvHead];
    }

    getRow(rowNo: number) {
        return this.csvRows[rowNo];
    }

    getTotalRows() {
        return this.totalRows;
    }

    async loadCSV() {
        this.setInputStream();
        await this.loadAllRows();
        return this;
    }

    private setInputStream() {
        this.inputStream = fs
            .createReadStream(this.csvFilePath)
            .pipe(new AutoDetectDecoderStream({ defaultEncoding: "1255" }))
            .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }));
    }

    private loadAllRows() {
        return new Promise<void>((resolve, reject) => {
            this.inputStream
                .on("data", (row: CSVRow) => this.appendNextRow(row))
                .on("end", () => {
                    this.printFinishedLoadingDetails();
                    resolve(void 0);
                })
                .on("error", reject);
        });
    }

    private appendNextRow(row: CSVRow) {
        this.csvRows[this.totalRows++] = row; // PERF
    }

    private printFinishedLoadingDetails() {
        console.log("Finshed loading. Obtained", this.totalRows, "rows");
        console.log("Heads are:", this.getHeads());
        console.log(
            "First 4 rows are:",
            this.getRow(0),
            this.getRow(1),
            this.getRow(2),
            this.getRow(3)
        );
    }
}

const rootDirectory = process.cwd();
