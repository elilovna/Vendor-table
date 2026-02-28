export const PARTNER_TYPES = ['Supplier', 'Partner'] as const;

export type PartnerType = (typeof PARTNER_TYPES)[number];

export interface Vendor {
    id?: number;
    name: string;
    contact_person: string;
    email: string;
    partner_type: PartnerType;
}