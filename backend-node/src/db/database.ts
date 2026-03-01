import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

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

const dbPath = getDbPath();

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Failed to connect to database:', err);
        process.exit(1);
    }
    console.log(`Connected to SQLite database at: ${dbPath}`);
});

// Resolves when schema and seed data are ready
export const dbReady = new Promise<void>((resolve, reject) => {
    db.run(`
        CREATE TABLE IF NOT EXISTS vendors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            contact_person TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            partner_type TEXT NOT NULL
        )
    `, (err) => {
        if (err) {
            reject(err);
            return;
        }

        db.get('SELECT COUNT(*) as count FROM vendors', (err, result: { count: number }) => {
            if (err) {
                reject(err);
                return;
            }

            if (result.count === 0) {
                db.run(`
                    INSERT INTO vendors (name, contact_person, email, partner_type) VALUES
                    ('Acme Corp', 'John Doe', 'john@acmecorp.com', 'Supplier'),
                    ('Globex Inc', 'Jane Smith', 'jane@globex.com', 'Supplier'),
                    ('Initech LLC', 'Michael Johnson', 'michael@initech.com', 'Partner'),
                    ('Umbrella Corp', 'Sarah Williams', 'sarah@umbrellacorp.com', 'Partner')
                `, (err) => {
                    if (err) reject(err);
                    else {
                        console.log('Sample vendor data inserted');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    });
});

export default db;
