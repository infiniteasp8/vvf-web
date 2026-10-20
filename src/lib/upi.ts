/** Build a UPI deep link that any UPI app on the phone can open. No amount is fixed. */
export function upiLink(params: {
  id: string;
  payeeName: string;
  /** Merchant category code, when the bank's own QR carries one. */
  merchantCode?: string;
  note?: string;
}): string {
  const search = new URLSearchParams();
  search.set('pa', params.id);
  search.set('pn', params.payeeName);
  if (params.merchantCode) search.set('mc', params.merchantCode);
  if (params.note) search.set('tn', params.note);
  search.set('cu', 'INR');
  // URLSearchParams encodes spaces as "+", which UPI apps do not all accept.
  return `upi://pay?${search.toString().replace(/\+/g, '%20')}`;
}

/** Bank details as a single block of text for the "copy all" button. */
export function bankDetailsText(bank: {
  accountName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  branch: string;
}): string {
  return [
    bank.accountName,
    `A/c ${digitsOnly(bank.accountNumber)}`,
    `IFSC ${bank.ifsc}`,
    `${bank.bankName}, ${bank.branch}`,
  ].join('\n');
}

export function digitsOnly(value: string): string {
  return value.replace(/\s+/g, '');
}

export function isPlausibleUpiId(value: string): boolean {
  return /^[a-z0-9][a-z0-9._-]{1,}@[a-z][a-z0-9]{1,}$/i.test(value);
}

export function isPlausibleIfsc(value: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value);
}
