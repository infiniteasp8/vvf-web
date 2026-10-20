import QRCode from 'qrcode';

/**
 * Render a UPI payment QR as an inline SVG string at build time.
 * The QR encodes the same upi:// link the "open in app" button uses, so a
 * phone camera, a UPI app and the button all resolve to the same payee.
 */
export async function qrSvg(payload: string): Promise<string> {
  const svg = await QRCode.toString(payload, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 0,
    color: { dark: '#1F1A17', light: '#FFFFFF' },
  });
  // Drop the fixed size so the SVG scales with its container, and mark it decorative:
  // the surrounding markup carries the accessible description.
  return svg
    .replace(/\s(width|height)="[^"]*"/g, '')
    .replace('<svg ', '<svg aria-hidden="true" focusable="false" ');
}
