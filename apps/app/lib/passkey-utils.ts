import type { Passkey } from 'better-auth/plugins/passkey';
import { UAParser } from 'ua-parser-js';

/**
 * Utility functions for passkey management
 */

/**
 * Generate a meaningful passkey name based on user agent and device info
 */
export function generatePasskeyName(): string {
  const env = process.env.NODE_ENV || 'development';
  const parser = new UAParser();
  const os = parser.getOS();
  const browser = parser.getBrowser();

  const osName = os.name || 'Unknown OS';
  const browserName = browser.name || 'Unknown Browser';

  return `${browserName} - ${osName}${env === 'development' ? ' (Local)' : ''}`;
}

/**
 * Get human-readable device type description
 */
export function getDeviceTypeDescription(
  deviceType: Passkey['deviceType'],
  passkeyName?: Passkey['name'],
): string {
  switch (deviceType) {
    case 'singleDevice':
      return `Only On ${passkeyName || 'where it was created on'}`;
    case 'multiDevice':
      return 'Synced Across Devices';
    default:
      return 'Unknown Device Type';
  }
}
