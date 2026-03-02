export const VALID_PARTNER_TYPES = ['Supplier', 'Partner'] as const;

export type PartnerType = (typeof VALID_PARTNER_TYPES)[number];

export interface Vendor {
    id: number;
    name: string;
    contact_person: string;
    email: string;
    partner_type: PartnerType;
}

export interface CreateVendorInput {
    name: string;
    contact_person: string;
    email: string;
    partner_type: PartnerType;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidPartnerType(value: string): value is PartnerType {
    return (VALID_PARTNER_TYPES as readonly string[]).includes(value);
}

export function validateVendorInput(body: unknown): { data: CreateVendorInput } | { error: string } {
    if (typeof body !== 'object' || body === null) {
        return { error: 'All fields are required' };
    }

    // Safe narrowing — typeof/null check above guarantees object
    const obj = body as Record<string, unknown>;
    const name = typeof obj.name === 'string' ? obj.name.trim() : '';
    const contact_person = typeof obj.contact_person === 'string' ? obj.contact_person.trim() : '';
    const email = typeof obj.email === 'string' ? obj.email.trim() : '';
    const partner_type = typeof obj.partner_type === 'string' ? obj.partner_type.trim() : '';

    if (!name || !contact_person || !email || !partner_type) {
        return { error: 'All fields are required' };
    }

    if (!EMAIL_REGEX.test(email)) {
        return { error: 'Invalid email format' };
    }

    if (!isValidPartnerType(partner_type)) {
        return { error: `partner_type must be one of: ${VALID_PARTNER_TYPES.join(', ')}` };
    }

    return { data: { name, contact_person, email, partner_type } };
}
