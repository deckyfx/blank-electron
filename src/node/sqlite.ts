
import SQLite3 from 'sqlite3';

import { DB_PATH } from "../types/constants";

const sqlite3 = SQLite3.verbose();

const db = new sqlite3.Database(DB_PATH);

export function closeSQLite() {
    db.close();
}

export function writeSQLite(data: string) {
  return new Promise<boolean>((resolve, reject) => {
    db.serialize(() => {
      const stmt = db.prepare("INSERT INTO demo VALUES (NULL, ?, ?)");
      stmt.run(data, new Date().toISOString());
      stmt.finalize();
      resolve(true);
    });
  });
}

export function readSQLite() {
  return new Promise<any>((resolve, reject) => {
    db.serialize(() => {
      const result: any[] = [];
      db.each("SELECT * FROM Departments LIMIT 1000", (err, row: any) => {
        result.push({
          id: row.DepartmentNo,
          name: row.DepartmentName,
          hint: row.DataStatus,
        });
      }, () => {
        resolve(result);
      });
    });
  });
}