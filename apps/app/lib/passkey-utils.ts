/**
 * Utility functions for passkey management
 */

/**
 * Generate a meaningful passkey name based on user agent and device info
 */
export function generatePasskeyName(
  deviceType?: 'platform' | 'cross-platform',
  userAgent?: string,
): string {
  const ua =
    userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '');

  // Detect browser
  let browser = 'Unknown Browser';
  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browser = 'Chrome';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
  } else if (ua.includes('Edg')) {
    browser = 'Edge';
  } else if (ua.includes('Opera') || ua.includes('OPR')) {
    browser = 'Opera';
  }

  // Detect operating system
  let os = 'Unknown OS';
  if (ua.includes('Windows')) {
    os = 'Windows';
  } else if (ua.includes('Mac OS X') || ua.includes('macOS')) {
    os = 'macOS';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  } else if (ua.includes('Android')) {
    os = 'Android';
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
  }

  // Generate name based on device type
  if (deviceType === 'platform') {
    // Platform authenticators (biometrics, device PIN)
    if (os === 'Windows') {
      return `${browser} on Windows Hello`;
    }
    if (os === 'macOS') {
      return `${browser} on Touch ID`;
    }
    if (os === 'iOS') {
      return `${browser} on Face ID`;
    }
    if (os === 'Android') {
      return `${browser} on Android Biometrics`;
    }
    return `${browser} on ${os}`;
  }
  if (deviceType === 'cross-platform') {
    // Cross-platform authenticators (security keys, phone)
    return `Security Key via ${browser}`;
  }
  // Default/auto-detected
  return `${browser} on ${os}`;
}

/**
 * Get device type icon component name based on device type
 */
export function getDeviceTypeIcon(
  deviceType: string,
): 'Monitor' | 'Smartphone' {
  return deviceType === 'cross-platform' ? 'Monitor' : 'Smartphone';
}

/**
 * Get human-readable device type description
 */
export function getDeviceTypeDescription(deviceType: string): string {
  switch (deviceType) {
    case 'platform':
      return 'Built-in authenticator (biometrics, PIN)';
    case 'cross-platform':
      return 'External security key or phone';
    default:
      return 'Authenticator device';
  }
}
