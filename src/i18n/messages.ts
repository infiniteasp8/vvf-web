import type { Locale } from './index';

import enCommon from './messages/en/common.json';
import enHome from './messages/en/home.json';
import enAbout from './messages/en/about.json';
import enEducation from './messages/en/education.json';
import enLife from './messages/en/life.json';
import enMoments from './messages/en/moments.json';
import enDonate from './messages/en/donate.json';
import enVisit from './messages/en/visit.json';

import hiCommon from './messages/hi/common.json';
import hiHome from './messages/hi/home.json';
import hiAbout from './messages/hi/about.json';
import hiEducation from './messages/hi/education.json';
import hiLife from './messages/hi/life.json';
import hiMoments from './messages/hi/moments.json';
import hiDonate from './messages/hi/donate.json';
import hiVisit from './messages/hi/visit.json';

import saCommon from './messages/sa/common.json';
import saHome from './messages/sa/home.json';
import saAbout from './messages/sa/about.json';
import saEducation from './messages/sa/education.json';
import saLife from './messages/sa/life.json';
import saMoments from './messages/sa/moments.json';
import saDonate from './messages/sa/donate.json';
import saVisit from './messages/sa/visit.json';

const en = {
  common: enCommon,
  home: enHome,
  about: enAbout,
  education: enEducation,
  life: enLife,
  moments: enMoments,
  donate: enDonate,
  visit: enVisit,
};

/** The English bundle defines the shape every other language must match. */
export type Messages = typeof en;

export const messages: Record<Locale, Messages> = {
  en,
  hi: {
    common: hiCommon,
    home: hiHome,
    about: hiAbout,
    education: hiEducation,
    life: hiLife,
    moments: hiMoments,
    donate: hiDonate,
    visit: hiVisit,
  },
  sa: {
    common: saCommon,
    home: saHome,
    about: saAbout,
    education: saEducation,
    life: saLife,
    moments: saMoments,
    donate: saDonate,
    visit: saVisit,
  },
};

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}

/** Replace {name}-style placeholders in a message. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
