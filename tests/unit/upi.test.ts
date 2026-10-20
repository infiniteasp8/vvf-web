import { describe, expect, it } from 'vitest';
import { bankDetailsText, digitsOnly, isPlausibleIfsc, isPlausibleUpiId, upiLink } from '@/lib/upi';
import { site } from '@/data/site';

describe('UPI deep link', () => {
  it('encodes payee, name and currency and fixes no amount', () => {
    const link = upiLink({ id: 'name@bank', payeeName: 'Ved Vidyalaya Foundation' });
    expect(link).toBe('upi://pay?pa=name%40bank&pn=Ved%20Vidyalaya%20Foundation&cu=INR');
    expect(link).not.toContain('am=');
  });

  it('adds a transaction note when given', () => {
    expect(upiLink({ id: 'a@b', payeeName: 'X', note: 'In memory' })).toContain('tn=In%20memory');
  });

  it('carries the merchant code only when one is set', () => {
    expect(upiLink({ id: 'a@b', payeeName: 'X', merchantCode: '8211' })).toContain('&mc=8211&');
    expect(upiLink({ id: 'a@b', payeeName: 'X', merchantCode: '' })).not.toContain('mc=');
  });
});

describe('bank details', () => {
  it('strips spaces from the account number and joins lines', () => {
    expect(digitsOnly('0000 1111 2222')).toBe('000011112222');
    const text = bankDetailsText({
      accountName: 'VVF',
      accountNumber: '12 34',
      ifsc: 'SBIN0001234',
      bankName: 'SBI',
      branch: 'Main',
    });
    expect(text.split('\n')).toEqual(['VVF', 'A/c 1234', 'IFSC SBIN0001234', 'SBI, Main']);
  });

  it('recognises plausible identifiers', () => {
    expect(isPlausibleUpiId('vedvidyalaya@sbi')).toBe(true);
    expect(isPlausibleUpiId('not an id')).toBe(false);
    expect(isPlausibleIfsc('SBIN0001234')).toBe(true);
    expect(isPlausibleIfsc('SBIN1234')).toBe(false);
  });
});

describe('site configuration', () => {
  it('has a UPI ID and IFSC in the right shape', () => {
    expect(isPlausibleUpiId(site.upi.id), 'site.upi.id').toBe(true);
    expect(isPlausibleIfsc(site.bank.ifsc), 'site.bank.ifsc').toBe(true);
    expect(digitsOnly(site.bank.accountNumber)).toMatch(/^\d{9,18}$/);
    if (site.upi.merchantCode) expect(site.upi.merchantCode).toMatch(/^\d{4}$/);
  });

  it('has a WhatsApp number in international digits-only form, if set', () => {
    if (site.contact.whatsapp) expect(site.contact.whatsapp).toMatch(/^\d{10,15}$/);
  });

  it('has at least one address line and a payee name', () => {
    expect(site.contact.address.lines.length).toBeGreaterThan(0);
    expect(site.contact.address.postalCode).toMatch(/^\d{6}$/);
    expect(site.upi.payeeName.length).toBeGreaterThan(0);
  });

  it('has map coordinates inside India, if set', () => {
    if (!site.contact.geo) return;
    expect(site.contact.geo.latitude).toBeGreaterThan(6);
    expect(site.contact.geo.latitude).toBeLessThan(38);
    expect(site.contact.geo.longitude).toBeGreaterThan(68);
    expect(site.contact.geo.longitude).toBeLessThan(98);
  });
});
