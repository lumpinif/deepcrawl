export function getCancelMessage(): string {
  return [
    'Deepcrawl setup cancelled.',
    'No folder or project was created.',
  ].join('\n');
}
