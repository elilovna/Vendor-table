import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import app from '../src/app';
import { initDatabase, getDb, closeDatabase } from '../src/db/database';
import type { Server } from 'http';

if (process.env.DB_PATH !== ':memory:') {
    throw new Error('Tests must run with DB_PATH=:memory: — use "bun run test"');
}

let server: Server;
let baseUrl: string;

// ── Helpers ───────────────────────────────────────────────────

function runSql(sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
        getDb().run(sql, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function queryAll<T>(sql: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
        getDb().all(sql, (err, rows) => {
            if (err) reject(err);
            // sqlite3 callback types aren't generic — safe to narrow here
            else resolve(rows as T[]);
        });
    });
}

function get(path: string): Promise<Response> {
    return fetch(`${baseUrl}${path}`);
}

function post(path: string, data: unknown): Promise<Response> {
    return fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

function put(path: string, data: unknown): Promise<Response> {
    return fetch(`${baseUrl}${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

function del(path: string): Promise<Response> {
    return fetch(`${baseUrl}${path}`, { method: 'DELETE' });
}

const validVendor = {
    name: 'Test Corp',
    contact_person: 'Test Person',
    email: 'test@testcorp.com',
    partner_type: 'Supplier'
};

interface SeededVendor { id: number; email: string }
let seeded: SeededVendor[] = [];

// ── Setup / Teardown ──────────────────────────────────────────

beforeAll(async () => {
    await initDatabase();
    await new Promise<void>((resolve) => {
        server = app.listen(0, () => {
            const address = server.address() as { port: number };
            baseUrl = `http://localhost:${address.port}`;
            resolve();
        });
    });
});

afterAll(async () => {
    server.close();
    await closeDatabase();
});

beforeEach(async () => {
    await runSql('DELETE FROM vendors');
    await runSql(`
        INSERT INTO vendors (name, contact_person, email, partner_type) VALUES
        ('Acme Corp', 'John Doe', 'john@acmecorp.com', 'Supplier'),
        ('Globex Inc', 'Jane Smith', 'jane@globex.com', 'Partner')
    `);
    seeded = await queryAll<SeededVendor>('SELECT id, email FROM vendors ORDER BY id');
});

// ── Health check ──────────────────────────────────────────────

describe('GET /health', () => {
    it('should return status ok', async () => {
        const res = await get('/health');
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ status: 'ok' });
    });
});

// ── GET /api/vendors ──────────────────────────────────────────

describe('GET /api/vendors', () => {
    it('should return all vendors', async () => {
        const res = await get('/api/vendors');
        expect(res.status).toBe(200);
        expect(await res.json()).toHaveLength(2);
    });

    it('should return vendors with correct fields', async () => {
        const res = await get('/api/vendors');
        const vendors = await res.json();
        expect(vendors[0]).toHaveProperty('id');
        expect(vendors[0]).toHaveProperty('name');
        expect(vendors[0]).toHaveProperty('contact_person');
        expect(vendors[0]).toHaveProperty('email');
        expect(vendors[0]).toHaveProperty('partner_type');
    });

    it('should return empty array when no vendors exist', async () => {
        await runSql('DELETE FROM vendors');
        const res = await get('/api/vendors');
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual([]);
    });
});

// ── POST /api/vendors ─────────────────────────────────────────

describe('POST /api/vendors', () => {
    it('should create a new vendor with valid data', async () => {
        const res = await post('/api/vendors', validVendor);
        expect(res.status).toBe(201);

        const body = await res.json();
        expect(body.id).toBeDefined();
        expect(body.name).toBe('Test Corp');
        expect(body.contact_person).toBe('Test Person');
        expect(body.email).toBe('test@testcorp.com');
        expect(body.partner_type).toBe('Supplier');
    });

    it('should trim whitespace from input fields', async () => {
        const res = await post('/api/vendors', {
            name: '  Trimmed Corp  ',
            contact_person: '  Jane  ',
            email: '  trimmed@test.com  ',
            partner_type: 'Supplier'
        });
        expect(res.status).toBe(201);

        const body = await res.json();
        expect(body.name).toBe('Trimmed Corp');
        expect(body.contact_person).toBe('Jane');
        expect(body.email).toBe('trimmed@test.com');
    });

    it('should persist the created vendor', async () => {
        await post('/api/vendors', { ...validVendor, email: 'persist@test.com' });

        const res = await get('/api/vendors');
        expect(await res.json()).toHaveLength(3);
    });

    it('should return 400 when missing required fields', async () => {
        const res = await post('/api/vendors', { name: 'Incomplete Corp' });
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('All fields are required');
    });

    it('should return 400 when body is empty', async () => {
        const res = await post('/api/vendors', {});
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('All fields are required');
    });

    it('should return 400 when fields are whitespace only', async () => {
        const res = await post('/api/vendors', { ...validVendor, name: '   ' });
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('All fields are required');
    });

    it('should return 400 when fields are non-string values', async () => {
        const res = await post('/api/vendors', {
            name: 123,
            contact_person: true,
            email: 'test@test.com',
            partner_type: 'Supplier'
        });
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('All fields are required');
    });

    it('should return 400 for invalid email format', async () => {
        const res = await post('/api/vendors', { ...validVendor, email: 'not-an-email' });
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('Invalid email format');
    });

    it('should return 400 for email missing domain', async () => {
        const res = await post('/api/vendors', { ...validVendor, email: 'user@' });
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('Invalid email format');
    });

    it('should return 400 for invalid partner_type', async () => {
        const res = await post('/api/vendors', { ...validVendor, partner_type: 'InvalidType' });
        expect(res.status).toBe(400);
        expect((await res.json()).error).toContain('partner_type');
    });

    it('should return 409 for duplicate email', async () => {
        const res = await post('/api/vendors', { ...validVendor, email: seeded[0].email });
        expect(res.status).toBe(409);
        expect((await res.json()).error).toContain('email already exists');
    });
});

// ── PUT /api/vendors/:id ──────────────────────────────────────

describe('PUT /api/vendors/:id', () => {
    it('should update an existing vendor', async () => {
        const res = await put(`/api/vendors/${seeded[0].id}`, {
            name: 'Updated Acme',
            contact_person: 'Updated John',
            email: 'updated@acmecorp.com',
            partner_type: 'Partner'
        });
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body.name).toBe('Updated Acme');
        expect(body.contact_person).toBe('Updated John');
        expect(body.email).toBe('updated@acmecorp.com');
        expect(body.partner_type).toBe('Partner');
    });

    it('should trim whitespace on update', async () => {
        const res = await put(`/api/vendors/${seeded[0].id}`, {
            name: '  Trimmed  ',
            contact_person: '  Person  ',
            email: '  trimmed@update.com  ',
            partner_type: 'Supplier'
        });
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body.name).toBe('Trimmed');
        expect(body.contact_person).toBe('Person');
        expect(body.email).toBe('trimmed@update.com');
    });

    it('should return 400 for non-numeric ID', async () => {
        const res = await put('/api/vendors/abc', validVendor);
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('Invalid vendor ID');
    });

    it('should return 400 when missing required fields', async () => {
        const res = await put(`/api/vendors/${seeded[0].id}`, { name: 'Only Name' });
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('All fields are required');
    });

    it('should return 400 for invalid email format on update', async () => {
        const res = await put(`/api/vendors/${seeded[0].id}`, { ...validVendor, email: 'bad-email' });
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('Invalid email format');
    });

    it('should return 400 for invalid partner_type', async () => {
        const res = await put(`/api/vendors/${seeded[0].id}`, { ...validVendor, partner_type: 'BadType' });
        expect(res.status).toBe(400);
        expect((await res.json()).error).toContain('partner_type');
    });

    it('should return 404 for non-existent vendor', async () => {
        const res = await put('/api/vendors/999', { ...validVendor, email: 'ghost@nowhere.com' });
        expect(res.status).toBe(404);
        expect((await res.json()).error).toBe('Vendor not found');
    });

    it('should return 409 when updating to a duplicate email', async () => {
        const res = await put(`/api/vendors/${seeded[0].id}`, { ...validVendor, email: seeded[1].email });
        expect(res.status).toBe(409);
        expect((await res.json()).error).toContain('email already exists');
    });
});

// ── DELETE /api/vendors/:id ───────────────────────────────────

describe('DELETE /api/vendors/:id', () => {
    it('should delete an existing vendor', async () => {
        const res = await del(`/api/vendors/${seeded[0].id}`);
        expect(res.status).toBe(204);

        const vendors = await (await get('/api/vendors')).json();
        expect(vendors).toHaveLength(1);
    });

    it('should return 400 for non-numeric ID', async () => {
        const res = await del('/api/vendors/abc');
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('Invalid vendor ID');
    });

    it('should return 404 for non-existent vendor', async () => {
        const res = await del('/api/vendors/999');
        expect(res.status).toBe(404);
        expect((await res.json()).error).toBe('Vendor not found');
    });
});
