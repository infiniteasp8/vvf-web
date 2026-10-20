/**
 * ------------------------------------------------------------------
 *  SITE DETAILS — the one file to edit with the Foundation's real data
 * ------------------------------------------------------------------
 *
 *    • upi.*       → the UPI ID the bank gave you (the QR is generated from it)
 *    • bank.*      → the account that receives transfers
 *    • contact.*   → phone, WhatsApp, email, postal address, map link
 *    • social.*    → leave empty strings for anything you do not use
 *
 *  Text that appears on the pages lives in src/i18n/messages/<language>/.
 *  Photos and films live in src/content/moments/.
 */
export const site = {
  /** Legal name as it should appear on the bank transfer screen. */
  name: 'Ved Vidyalaya Foundation',
  nameDevanagari: 'वेद विद्यालय फाउंडेशन',
  shortName: 'Ved Vidyalaya',
  /** Year the site went live, used in the footer copyright. */
  since: 2026,

  upi: {
    /** The VPA printed on the Yes Bank QR stand. */
    id: 'yespay.bizsbiz59861@yesbankltd',
    /** Name shown inside the UPI app when the code is scanned. */
    payeeName: 'Ved Vidyalaya Foundation',
    /**
     * Merchant category code embedded in the bank's own QR (8211 = schools and
     * educational services). Kept so the generated QR and the "open UPI app"
     * link carry exactly what the bank's QR carries. Empty string to omit.
     */
    merchantCode: '8211',
    /**
     * Optional: path to a QR image supplied by the bank, placed in /public,
     * e.g. "/qr/bank-qr.png". Leave null to use the QR generated from upi.id.
     */
    qrImage: null as string | null,
  },

  bank: {
    accountName: 'Ved Vidyalaya Foundation',
    /** Spaces are only for display; the copy button strips them. */
    accountNumber: '0663 8870 0000 987',
    ifsc: 'YESB0000663',
    bankName: 'Yes Bank',
    branch: 'K.P. Kakkar Road, Prayagraj',
  },

  contact: {
    /** Display form of the phone number. Empty string hides the phone link. */
    phone: '+91 80042 12828',
    /** WhatsApp number in international format without "+", e.g. "919876543210". */
    whatsapp: '918004212828',
    /** Empty string hides the email link. */
    email: '',
    address: {
      /** Lines as they appear on the Visit page. */
      lines: [
        'Ved Vidyalaya Foundation',
        'In front of Namami Gange, near Jagat Pita Brahmdev Ashram',
        'Naini, Prayagraj, Uttar Pradesh 211008',
      ],
      /** Street part only, for structured data. */
      street: 'In front of Namami Gange, near Jagat Pita Brahmdev Ashram, Naini',
      locality: 'Prayagraj',
      region: 'Uttar Pradesh',
      postalCode: '211008',
      country: 'IN',
    },
    /** Link to the Gurukul on a map. Empty string hides the directions button. */
    mapUrl: 'https://maps.app.goo.gl/PqgxsGqQ5igpXRUcA',
    /** Pin coordinates from the map link, for structured data. Null to omit. */
    geo: { latitude: 25.3966351, longitude: 81.8914669 } as {
      latitude: number;
      longitude: number;
    } | null,
  },

  social: {
    youtube: '',
    instagram: '',
    facebook: '',
  },
} as const;

export type Site = typeof site;
