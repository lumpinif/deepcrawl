export function isPlausibleUrl(input: string): boolean {
  const value = input.trim();
  if (value.length === 0) {
    return false;
  }
  if (value.includes(' ')) {
    return false;
  }

  // Reject pure numbers (they get interpreted as IP addresses)
  if (/^\d+$/.test(value)) {
    return false;
  }

  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const url = new URL(candidate);
    const hostname = url.hostname;

    if (hostname === 'localhost') {
      return true;
    }

    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
      return true;
    }

    if (!hostname.includes('.')) {
      return false;
    }

    if (!/^[a-z0-9.-]+$/i.test(hostname)) {
      return false;
    }

    const labels = hostname.split('.');
    const hasBadLabel = labels.some((label) => {
      if (label.length === 0) {
        return true;
      }
      if (label.startsWith('-')) {
        return true;
      }
      if (label.endsWith('-')) {
        return true;
      }
      return false;
    });
    if (hasBadLabel) {
      return false;
    }

    const tld = labels.at(-1);
    if (!(tld && /^[a-z]{2,63}$/i.test(tld))) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
