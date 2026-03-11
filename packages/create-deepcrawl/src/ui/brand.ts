import { dimText } from './dim.js';

const DEEPCRAWL_LOGO = [
  '╔╦╗╔═╗╔═╗╔═╗╔═╗╦═╗╔═╗╦ ╦╦',
  ' ║║║╣ ║╣ ╠═╝║  ╠╦╝╠═╣║║║║',
  '═╩╝╚═╝╚═╝╩  ╚═╝╩╚═╩ ╩╚╩╝╩═╝',
].join('\n');

export function renderDeepcrawlLogo(): string {
  return DEEPCRAWL_LOGO;
}

export function renderDeepcrawlHeader(): string {
  return [
    renderDeepcrawlLogo(),
    '',
    'deepcrawl.dev',
    dimText('one command to deploy deepcrawl fullstack yourself'),
  ].join('\n');
}
