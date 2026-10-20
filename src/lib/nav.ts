export type NavKey = 'about' | 'education' | 'life' | 'moments' | 'donate' | 'visit';

export const navItems: Array<{ key: NavKey; href: string }> = [
  { key: 'about', href: '/about/' },
  { key: 'education', href: '/education/' },
  { key: 'life', href: '/life/' },
  { key: 'moments', href: '/moments/' },
  { key: 'donate', href: '/donate/' },
  { key: 'visit', href: '/visit/' },
];
