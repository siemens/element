/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
interface Section {
  value: string;
  current?: boolean;
  partNo?: number;
  /** Indicate this is a network mask. */
  mask?: boolean;
}

export interface Ip4SplitOptions {
  type?: 'insert' | 'delete' | 'paste';
  input?: string | null;
  pos: number;
  cidr?: boolean;
}

export interface Ip6SplitOptions {
  type?: 'insert' | 'delete' | 'paste';
  input?: string | null;
  pos: number;
  zeroCompression?: boolean;
  cidr?: boolean;
}

const isDigit = (c: string): boolean => c >= '0' && c <= '9';
const isHex = (c: string): boolean => (c >= '0' && c <= '9') || (c >= 'A' && c <= 'F');

const recursiveSplitIpV4 = (
  options: Ip4SplitOptions,
  input: string,
  sections: Section[] = [{ value: '', partNo: 0 }],
  index: number = 0,
  cursorDelta: number = 0
): { sections: Section[]; cursorDelta: number } => {
  // Base case: no more input to process
  if (input.length === 0) {
    return { sections, cursorDelta };
  }
  const current = sections.at(-1)!;
  const char = input[0];
  input = input.substring(1);
  if (isDigit(char)) {
    const part = `${current.value}${char}`;
    const limit = current.mask ? 32 : 255;
    // Append digits to current part until the part limit exceeds
    if (part.length <= 3 && parseInt(part, 10) <= limit) {
      current.value = part;
    } else {
      // Base case: IP completely entered
      if ((options.cidr && current.mask) || (!options.cidr && current.partNo === 3)) {
        return { sections, cursorDelta };
      }
      // Force separators since the part exceeded his limit
      if (current.partNo === 3) {
        input = `/${char}${input.replace('.', '').replace('/', '')}`;
      } else {
        const dotIndex = input.indexOf('.');
        if (dotIndex >= 0) {
          input = input.substring(0, dotIndex) + input.substring(dotIndex + 1);
        }
        input = `.${char}${input}`;
      }
      // In case the cursor position is at the the position of the exceeded digit it is necessary
      // to move the cursor one position forward since a separator will be added before the digit
      if (index === options.pos) {
        cursorDelta = 1;
      }
    }
  } else if (char === '.' || char === '/') {
    // Handle separators
    if ('partNo' in current && current.partNo! < 3) {
      sections.push({ value: '.' }, { value: '', partNo: current.partNo! + 1 });
    } else if (options.cidr && !current.mask) {
      sections.push({ value: '/' }, { value: '', mask: true });
    }
  }

  return recursiveSplitIpV4(options, input, sections, index + 1, cursorDelta);
};

/**
 * Parse IPv4 input string into IPv4 address section array.
 */
export const splitIpV4Sections = (
  options: Ip4SplitOptions
): { value: string; cursorDelta: number } => {
  const { input } = options;
  if (!input) {
    return { value: '', cursorDelta: 0 };
  }
  const { sections, cursorDelta } = recursiveSplitIpV4(options, input);
  return {
    value: sections.map(s => s.value).join(''),
    cursorDelta
  };
};

export const splitIpV6Sections = (
  options: Ip6SplitOptions
): { value: string; cursorDelta: number } => {
  const { type, input, pos, zeroCompression, cidr } = options;
  const sections: Section[] = [{ value: '' }];
  let cursorDelta = 0;
  if (!input) {
    return { value: '', cursorDelta: 0 };
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
      let charsProcessed = 0;
      for (let p = 0; p < value.length; p += 4) {
        const part = value.substring(p, p + 4);
        append.push({ value: part });
        if (part.length === 4) {
          append.push({ value: ':' });
          if (current && pos >= charsProcessed) {
            cursorDelta++;
          }
        }
        charsProcessed += 4;
      }

      sections.splice(i, 1, ...append);
      if (current) {
        sections[i + append.length - 1].current = true;
      }
    }
  }

  // Drop invalid zero compression indicators '::'
  const removeEnd = pos === input.length || type === 'paste';
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

  const value = sections
    .splice(0, cidr ? 17 : 15)
    .map(s => s.value)
    .join('');
  return { value, cursorDelta };
};
