import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderDeepcrawlHeader, renderDeepcrawlLogo } from '../ui/brand.js';

test('renderDeepcrawlLogo returns the Deepcrawl ASCII logo', () => {
  assert.equal(
    renderDeepcrawlLogo(),
    [
      '╔╦╗╔═╗╔═╗╔═╗╔═╗╦═╗╔═╗╦ ╦╦',
      ' ║║║╣ ║╣ ╠═╝║  ╠╦╝╠═╣║║║║',
      '═╩╝╚═╝╚═╝╩  ╚═╝╩╚═╩ ╩╚╩╝╩═╝',
    ].join('\n'),
  );
});

test('renderDeepcrawlHeader reuses the logo block', () => {
  assert.equal(
    renderDeepcrawlHeader(),
    [
      renderDeepcrawlLogo(),
      '',
      'deepcrawl.dev',
      'one command to deploy deepcrawl fullstack yourself',
    ].join('\n'),
  );
});
