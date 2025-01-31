import SQLite3 from "sqlite3";

const sqlite3 = SQLite3.verbose();

let db: SQLite3.Database | null = null;

export function openSQLite(path: string) {
  db = new sqlite3.Database(path);
}

export function closeSQLite() {
  if (!db) {
    return;
  }
  db.close();
}

export function writeSQLite(data: string) {
  if (!db) {
    return;
  }
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
  if (!db) {
    return;
  }
  return new Promise<any>((resolve, reject) => {
    db.serialize(() => {
      const result: any[] = [];
      db.each(
        "SELECT * FROM Departments LIMIT 1000",
        (err, row: any) => {
          result.push({
            id: row.DepartmentNo,
            name: row.DepartmentName,
            hint: row.DataStatus,
          });
        },
        () => {
          resolve(result);
        }
      );
    });
  });
}
