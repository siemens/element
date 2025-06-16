/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
export interface Section {
  value: string;
  current?: boolean;
  /** Indicate this is a network mask. */
  mask?: boolean;
}

export interface Ip4SplitOptions {
  type?: 'insert' | 'delete' | 'paste';
  input?: string | null;
  pos?: number;
  cidr?: boolean;
}

export interface Ip6SplitOptions {
  type?: 'insert' | 'delete' | 'paste';
  input?: string | null;
  pos?: number;
  zeroCompression?: boolean;
  cidr?: boolean;
}

const isDigit = (c: string): boolean => c >= '0' && c <= '9';
const isHex = (c: string): boolean => (c >= '0' && c <= '9') || (c >= 'A' && c <= 'F');

/**
 * Parse IPv4 input string into IPv4 address section array.
 */
export const splitIpV4Sections = (options: Ip4SplitOptions): Section[] => {
  const { input, pos, cidr } = options;
  const sections: Section[] = [{ value: '' }];
  if (!input) {
    return sections;
  }
  let maxDots = 3;
  for (let i = 0; i < input.length; i++) {
    const c = input.charAt(i);
    if (isDigit(c)) {
      sections.at(-1)!.value += c;
    } else if (c === '.' && maxDots > 0) {
      maxDots--;
      sections.push({ value: c }, { value: '' });
    } else if (cidr && c === '/') {
      sections.push({ value: c }, { value: '', mask: true });
    }
    if (pos === i) {
      sections.at(-1)!.current = true;
    }
  }

  // Trim empty sections for example the user entered ..
  let previousDivider = false;
  for (let i = 0; i < sections.length; i += 2) {
    const isDivider = sections.at(i)?.value === '' && sections.at(i + 1)?.value === '.';
    if (previousDivider && isDivider) {
      sections.splice(i, 2);
    }
    previousDivider = isDivider;
  }

  // Split values > 255 in multiple sections:
  // - 256 will be split into 25 and 6
  // - 255255255 will be split into 255, 255 and 255
  for (let i = 0; i < sections.length; i++) {
    const { value, current } = sections[i];
    if (value.length >= 3 && parseInt(value, 10) > 255) {
      const append: Section[] = [];
      let n = '';
      for (const c of value) {
        if (parseInt(n + c, 10) > 255) {
          append.push({ value: n }, { value: '.' });
          n = c;
        } else {
          n += c;
        }
      }
      if (n.length > 0) {
        append.push({ value: n });
      }
      sections.splice(i, 1, ...append);
      if (current) {
        sections[i + append.length - 1].current = true;
      }
    }
  }

  // Split leading zero sections:
  // Assume a string starting by 0 e.g. 012 will be split into 0 and 12
  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    if (sec.value.length > 1 && sec.value.startsWith('0')) {
      sections.splice(i, 1, { value: '0' }, { value: sec.value.substring(1) });
    }
  }

  // Ensure the that the CIDR divider is a slash
  if (cidr) {
    const startCidr = 7;
    if (startCidr < sections.length && sections[startCidr].value === '.') {
      sections[startCidr].value = '/';
    }
    const prefixPos = startCidr + 1;
    if (prefixPos < sections.length) {
      const prefixLength = sections[prefixPos].value;
      if (parseInt(prefixLength, 10) > 32) {
        sections[prefixPos].value = prefixLength.substring(0, 2);
      }
    }
  }

  return sections;
};

export const splitIpV6Sections = (options: Ip6SplitOptions): Section[] => {
  const { type, input, pos, zeroCompression, cidr } = options;
  const sections: Section[] = [{ value: '' }];
  if (!input) {
    return sections;
  }

  for (let i = 0; i < input.length; i++) {
    const c = input.charAt(i).toUpperCase();
    if (isHex(c)) {
      sections.at(-1)!.value += c;
    } else if (c === ':') {
      if (input.charAt(i - 1) === c) {
        // Merge :: characters
        sections.at(-2)!.value += c;
      } else {
        sections.push({ value: c }, { value: '' });
      }
    } else if (cidr && c === '/') {
      sections.push({ value: c }, { value: '', mask: true });
    }
    if (pos === i) {
      sections.at(-1)!.current = true;
    }
  }

  // Split values > FFFF in multiple sections:
  // - 1FFFF will be split into 1FFF and F
  for (let i = 0; i < sections.length; i++) {
    const { value, current } = sections[i];
    if (value.length > 4) {
      const append: Section[] = [];
      for (let p = 0; p < value.length; p += 4) {
        const part = value.substring(p, p + 4);
        append.push({ value: part });
        if (part.length === 4) {
          append.push({ value: ':' });
        }
      }

      sections.splice(i, 1, ...append);
      if (current) {
        sections[i + append.length - 1].current = true;
      }
    }
  }

  // Drop invalid zero compression indicators '::'
  const removeEnd = pos === input.length - 1 || type === 'paste';
  let matches = sections.filter(s => s.value.startsWith('::'));
  if (matches) {
    matches = removeEnd ? matches : matches.reverse();
    if (zeroCompression) {
      matches.shift();
    }
    // Only allow one occurrence of ::
    for (const drop of matches) {
      drop.value = drop.value.substring(1);
    }
  }

  // Ensure the that the CIDR divider is a slash
  if (cidr) {
    const startCidr = matches.length > 0 ? 13 : 15;
    if (startCidr < sections.length && sections[startCidr].value === ':') {
      sections[startCidr].value = '/';
    }
    const prefixPos = startCidr + 1;
    if (prefixPos < sections.length) {
      const prefixLength = sections[prefixPos].value;
      if (parseInt(prefixLength, 10) > 128) {
        sections[prefixPos].value = prefixLength.substring(0, 2);
      }
    }
  }

  return sections;
};
