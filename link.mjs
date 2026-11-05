const privateSuffix = /(?:^|\.)(?:localhost|local|internal|lan|home|corp|onion|test|invalid|example|arpa)$/i;
const dnsName = /^(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z](?:[a-z\d-]{0,61}[a-z\d])?$/i;

export function parseLink(value) {
  if (typeof value !== 'string') return null;
  const input = value.trim();
  if (input.length > 2048 || /[\s\\\u0000-\u001f\u007f]/u.test(input) || !/^https?:\/\/[^/]/i.test(input)) return null;
  try {
    const url = new URL(input);
    const authority = input.slice(input.indexOf('://') + 3).split(/[/?#]/, 1)[0];
    const host = url.hostname.replace(/\.$/, '');
    if (authority.includes('@') || url.port || host.length > 253 || !dnsName.test(host) || privateSuffix.test(host)) return null;
    url.hostname = host;
    url.hash = '';
    return url.href.length <= 2048 ? url : null;
  } catch {
    return null;
  }
}

export function extractLink(text) {
  if (typeof text !== 'string') return '';
  const matches = text.slice(0, 8192).matchAll(/https?:\/\/[^\s<>"“”]+/gi);
  for (const [match] of matches) {
    if (parseLink(match)) return match;
    const trimmed = match.replace(/[.,;!?،؛؟)\]]+$/u, '');
    if (parseLink(trimmed)) return trimmed;
  }
  return '';
}
