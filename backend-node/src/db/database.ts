import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

let db: sqlite3.Database | null = null;

function getDbPath(): string {
    if (process.env.DB_PATH) {
        return process.env.DB_PATH;
    }
    const dataDir = path.resolve(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    return path.join(dataDir, 'vendors.db');
}

function openConnection(dbPath: string): Promise<sqlite3.Database> {
    return new Promise((resolve, reject) => {
        const instance = new sqlite3.Database(dbPath, (err) => {
            if (err) reject(err);
            else resolve(instance);
        });
    });
}

function run(database: sqlite3.Database, sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
        database.run(sql, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function get<T>(database: sqlite3.Database, sql: string): Promise<T> {
    return new Promise((resolve, reject) => {
        database.get(sql, (err, row) => {
            if (err) reject(err);
            else resolve(row as T);
        });
    });
}

export async function initDatabase(): Promise<void> {
    const dbPath = getDbPath();

    db = await openConnection(dbPath);
    console.log(`Connected to SQLite database at: ${dbPath}`);

    await run(db, `
        CREATE TABLE IF NOT EXISTS vendors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            contact_person TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            partner_type TEXT NOT NULL CHECK(partner_type IN ('Supplier', 'Partner'))
        )
    `);

    const result = await get<{ count: number }>(db, 'SELECT COUNT(*) as count FROM vendors');

    if (result.count === 0) {
        await run(db, `
            INSERT INTO vendors (name, contact_person, email, partner_type) VALUES
            ('Acme Corp', 'John Doe', 'john@acmecorp.com', 'Supplier'),
            ('Globex Inc', 'Jane Smith', 'jane@globex.com', 'Supplier'),
            ('Initech LLC', 'Michael Johnson', 'michael@initech.com', 'Partner'),
            ('Umbrella Corp', 'Sarah Williams', 'sarah@umbrellacorp.com', 'Partner')
        `);
        console.log('Sample vendor data inserted');
    }
}

export function getDb(): sqlite3.Database {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
}

export function closeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!db) {
            resolve();
            return;
        }
        db.close((err) => {
            if (err) reject(err);
            else {
                db = null;
                resolve();
            }
        });
    });
}
