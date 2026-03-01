import { Router, Request, Response } from 'express';
import db from '../db/database';
import { validateVendorInput } from '../models/Vendor';

const router = Router();

// GET /vendors - List all vendors
router.get('/', (_req: Request, res: Response) => {
    db.all('SELECT * FROM vendors', [], (err, rows) => {
        if (err) {
            console.error('GET /vendors error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(rows);
    });
});

// POST /vendors - Register a new vendor
router.post('/', (req: Request, res: Response) => {
    const result = validateVendorInput(req.body);
    if ('error' in result) {
        return res.status(400).json({ error: result.error });
    }

    const { name, contact_person, email, partner_type } = result.data;
    const sql = `INSERT INTO vendors (name, contact_person, email, partner_type) VALUES (?, ?, ?, ?)`;

    db.run(sql, [name, contact_person, email, partner_type], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'A vendor with this email already exists' });
            }
            console.error('POST /vendors error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        res.status(201).json({ id: this.lastID, name, contact_person, email, partner_type });
    });
});

// PUT /vendors/:id - Update a vendor
router.put('/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid vendor ID' });
    }

    const result = validateVendorInput(req.body);
    if ('error' in result) {
        return res.status(400).json({ error: result.error });
    }

    const { name, contact_person, email, partner_type } = result.data;
    const sql = `UPDATE vendors SET name = ?, contact_person = ?, email = ?, partner_type = ? WHERE id = ?`;

    db.run(sql, [name, contact_person, email, partner_type, id], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'A vendor with this email already exists' });
            }
            console.error('PUT /vendors error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Vendor not found' });
        }

        res.json({ id, name, contact_person, email, partner_type });
    });
});

// DELETE /vendors/:id - Delete a vendor
router.delete('/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid vendor ID' });
    }

    db.run('DELETE FROM vendors WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('DELETE /vendors error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Vendor not found' });
        }

        res.status(204).send();
    });
});

export default router;
