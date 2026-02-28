export const PARTNER_TYPES = ['Supplier', 'Partner'] as const;

export type PartnerType = (typeof PARTNER_TYPES)[number];

export interface VendorInput {
    name: string;
    contact_person: string;
    email: string;
    partner_type: PartnerType;
}

export interface Vendor extends VendorInput {
    id: number;
}