# Content guide

Everything the Foundation will want to change lives in five places. Nothing else needs touching.

## 1. UPI, bank and contact details — `src/data/site.ts`

```ts
upi: { id: 'yespay.bizsbiz59861@yesbankltd', payeeName, merchantCode: '8211', qrImage: null },
bank: { accountName, accountNumber: '0663 8870 0000 987', ifsc: 'YESB0000663', bankName, branch },
contact: { phone, whatsapp, email, address, mapUrl, geo },
```

- **UPI ID**: the VPA the bank gave you. The QR code on the site is generated from it on every build, and the "Open any UPI app" button uses the same ID, so the three can never disagree. `merchantCode` is the `mc=` value printed inside the bank's own QR; keep it in step if the bank issues a new QR.
- **Bank-supplied QR instead**: put the image in `public/qr/` and set `qrImage: '/qr/your-file.png'`.
- **WhatsApp**: international digits only, no `+` or spaces (`919876543210`). Leave `''` to hide the WhatsApp buttons.
- **Phone / email / map link**: leave `''` to hide that link everywhere.
- **Address**: `lines` are what the Visit page shows; `street`, `locality`, `region`, `postalCode` and `geo` feed the structured data search engines read. Update both when the Gurukul moves.

Run `npm run test` after editing: it checks the UPI ID and IFSC look valid and the account number is digits.

## 2. Page text — `src/i18n/messages/<language>/<page>.json`

One file per page per language (`common.json` holds the header, footer, buttons and the give panel). Edit the text between the quotes; keep the keys. The three languages must have the same keys, which `npm run test` enforces.

Things to know:

- `{name}` and `{field}` inside a string are filled in automatically; keep them.
- `arrival.mantra` is a list of words so they can rise one by one.
- Nothing in the copy should claim a registration, certificate or number the Foundation has not confirmed. A unit test refuses "80G", "12A", "FCRA", "PAN", "registered" and "Section 8".
- The Sanskrit and Hindi were written to be reviewed by an ācārya before launch.

## 3. Photographs and films — `src/content/moments/`

Each moment is one JSON file:

```json
{
  "kind": "photo",
  "featured": true,
  "order": 2,
  "date": "2026-06-14",
  "title": { "en": "Sandhyā by the water", "hi": "...", "sa": "..." },
  "caption": { "en": "...", "hi": "...", "sa": "..." },
  "alt": { "en": "What is in the picture", "hi": "...", "sa": "..." },
  "image": "../../assets/moments/sandhya-by-the-water.jpg"
}
```

- Put the photo in `src/assets/moments/` (JPEG or PNG, any size; the build resizes it) and reference it with `../../assets/moments/<file>`.
- `featured: true` shows it on the home page; every moment appears on the Moments page.
- `alt` describes the picture for people who cannot see it and for search engines. Write it in all three languages.
- `tone: "night"` for evening photographs.
- Films: `"kind": "film"`, add `"video": "https://www.youtube.com/watch?v=..."` (or a Vimeo link) and `"duration": "4 min"`. The image is the poster; the film plays in place when pressed, through YouTube's cookie-free player.

The current six moments are illustrations standing in for photographs. Replace them one by one.

## 4. Stories, voices and questions — `src/content/`

- `stories/` — the "Seasons of the Gurukul" cards: `kicker`, `title`, `body`, `date`, `order`.
- `voices/` — quotes from supporters, parents, former students: `quote`, `who`, `where`. Roles only, no names.
- `faq/` — questions on the give page (`"page": "donate"`) or the visit page (`"page": "visit"`).

All fields are `{ "en", "hi", "sa" }` objects. `order` decides the sequence (lower first).

## Checking your changes

```bash
npm run test      # translations, content files, site details
npm run build     # fails with a clear message if a JSON file is wrong
npm run preview   # look at it on http://localhost:4321
```

## Later: the admin panel

The structure above maps directly onto a git-based CMS (Keystatic or Decap). When that is added, these same files are edited through a form in the browser and every save publishes the site. Nothing in this guide changes; it just gets a friendlier front.

## 5. The logo — `src/assets/brand/`

`logo.png` is the whole emblem with its scroll, on a transparent background; `emblem.png` is the round seal alone. The header, footer, arrival sequence, favicons, app icons and the social-share images are all rendered from these two files.

To replace the logo, run from the project folder:

```bash
npm run brand path/to/new-logo.jpg -- --circle 540,392,288   # centre x, centre y and radius of the seal, in pixels of that file
npm run icons
```

The first command removes a white background and writes the two PNGs; the second re-renders every icon size and `public/brand/`. Leave out `--circle` to keep the existing emblem.
