/** Inline icon set. Stroke icons on a 24-unit grid, drawn in currentColor. */
export type IconName =
  | 'copy'
  | 'check'
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-down'
  | 'play'
  | 'whatsapp'
  | 'mail'
  | 'phone'
  | 'map'
  | 'menu'
  | 'close'
  | 'plus'
  | 'external'
  | 'lamp'
  | 'leaf'
  | 'book'
  | 'sun';

export const iconPaths: Record<IconName, string> = {
  copy: 'M9 9h12v12H9z M5 15V5a2 2 0 0 1 2-2h10',
  check: 'M5 12l4 4L19 6',
  'arrow-right': 'M4 12h16 M13 5l7 7-7 7',
  'arrow-left': 'M20 12H4 M11 5l-7 7 7 7',
  'arrow-down': 'M12 4v16 M5 13l7 7 7-7',
  play: 'M7 4v16l13-8z',
  whatsapp:
    'M3 21l1.6-4.7A8.5 8.5 0 1 1 7.9 19.4z M9 8.5c.2 2.5 2.5 5.3 5.5 6.5l1.5-1.5-2-1-1 1a5 5 0 0 1-2.5-2.5l1-1-1-2z',
  mail: 'M3 6h18v12H3z M3 7l9 6 9-6',
  phone:
    'M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z',
  map: 'M12 21s-7-6.5-7-11.5a7 7 0 0 1 14 0C19 14.5 12 21 12 21z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  menu: 'M4 7h16 M4 12h16 M4 17h16',
  close: 'M6 6l12 12 M18 6L6 18',
  plus: 'M12 5v14 M5 12h14',
  external: 'M14 4h6v6 M20 4l-9 9 M19 14v6H4V5h6',
  lamp: 'M12 3c-2.5 3.5-2.5 6 0 8.5 2.5-2.5 2.5-5 0-8.5z M5 15c0 3 3 5 7 5s7-2 7-5z M4 15h16',
  leaf: 'M4 20c0-9 5-14 16-16-1 11-6 16-16 16z M4 20l10-10',
  book: 'M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1.5 1.5 M17.5 17.5L19 19 M5 19l1.5-1.5 M17.5 6.5L19 5',
};
