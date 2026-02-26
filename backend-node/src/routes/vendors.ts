import { Router, Request, Response } from 'express';
import db from '../db/database';
import { Vendor } from '../models/Vendor';

const router = Router();

// GET /vendors - List all vendors
router.get('/', (req: Request, res: Response) => {
    db.all('SELECT * FROM vendors', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// POST /vendors - Register a new vendor
router.post('/', (req: Request, res: Response) => {
    const { name, contact_person, email, partner_type } = req.body as Vendor;
    
    if (!name || !contact_person || !email || !partner_type) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (partner_type !== 'Supplier' && partner_type !== 'Partner') {
        return res.status(400).json({ error: 'partner_type must be either "Supplier" or "Partner"' });
    }

    const sql = `INSERT INTO vendors (name, contact_person, email, partner_type) 
                 VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [name, contact_person, email, partner_type], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'A vendor with this email already exists' });
            }
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            id: this.lastID,
            name,
            contact_person,
            email,
            partner_type
        });
    });
});

// PUT /vendors/:id - Update a vendor
router.put('/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid vendor ID' });
    }

    const { name, contact_person, email, partner_type } = req.body as Vendor;

    if (!name || !contact_person || !email || !partner_type) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (partner_type !== 'Supplier' && partner_type !== 'Partner') {
        return res.status(400).json({ error: 'partner_type must be either "Supplier" or "Partner"' });
    }

    const sql = `UPDATE vendors SET name = ?, contact_person = ?, email = ?, partner_type = ? WHERE id = ?`;

    db.run(sql, [name, contact_person, email, partner_type, id], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'A vendor with this email already exists' });
            }
            return res.status(500).json({ error: err.message });
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
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Vendor not found' });
        }

        res.status(204).send();
    });
});

export default router;