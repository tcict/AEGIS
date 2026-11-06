import { parseLink } from './link.mjs';

const standardResolver = 'https://cloudflare-dns.com/dns-query';
const malwareResolver = 'https://security.cloudflare-dns.com/dns-query';
const shorteners = new Set(['bit.ly', 't.co', 'tinyurl.com', 'is.gd', 'ow.ly', 'cutt.ly', 'rb.gy', 'shorturl.at', 'buff.ly', 'lnkd.in']);
const redirectNames = /^(?:url|u|redirect|redirect_uri|redirect_url|next|return|return_to|returnurl|dest|destination|continue|target|to)$/i;
const sensitiveNames = /^(?:token|access_token|id_token|refresh_token|code|api[_-]?key|key|session(?:id)?|password|passwd|signature|sig|otp|x-amz-signature)$/i;
const accountWords = /(?:^|[^a-z])(?:login|signin|verify|password|wallet|claim|payment|account|otp)(?:[^a-z]|$)/i;
const executable = /\.(?:exe|msi|scr|bat|cmd|ps1|apk|dmg|pkg|iso|js|vbs|hta)\/?$/i;

export function inspectLink(input) {
  const url = parseLink(input);
  if (!url) return null;
  const host = url.hostname;
  const labels = host.split('.');
  const params = [...url.searchParams];
  const signals = [];
  let path = url.pathname;
  try { path = decodeURIComponent(path); } catch {}
  const redirectTargets = new Set();

  for (const [name, value] of params) {
    if (!redirectNames.test(name)) continue;
    try {
      const target = new URL(value, url);
      if (/^https?:$/.test(target.protocol) && target.origin !== url.origin) redirectTargets.add(target.hostname);
    } catch {}
  }

  if (url.protocol === 'http:') signals.push({ id: 'http', warning: true });
  if (labels.some(label => label.startsWith('xn--'))) signals.push({ id: 'idn', warning: true });
  if (shorteners.has(host.replace(/^www\./, ''))) signals.push({ id: 'shortener', warning: true });
  if (redirectTargets.size) signals.push({ id: 'redirect', warning: true, detail: [...redirectTargets].slice(0, 3).join(', ') });
  if (executable.test(path)) signals.push({ id: 'download', warning: true });
  if (labels.length >= 6) signals.push({ id: 'longHost', warning: false });
  if (accountWords.test(host + path)) signals.push({ id: 'accountWords', warning: false });
  if (params.some(([name]) => sensitiveNames.test(name))) signals.push({ id: 'sensitive', warning: false });

  return {
    host, protocol: url.protocol.slice(0, -1).toUpperCase(),
    pathDepth: url.pathname.split('/').filter(Boolean).length,
    parameters: params.length, fragment: input.includes('#'), signals
  };
}

async function lookup(base, host, type, signal, request) {
  const endpoint = new URL(base);
  endpoint.searchParams.set('name', host);
  endpoint.searchParams.set('type', type === 1 ? 'A' : 'AAAA');
  try {
    const response = await request(endpoint, {
      headers: { Accept: 'application/dns-json' }, credentials: 'omit',
      redirect: 'error', referrerPolicy: 'no-referrer', signal
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (!Number.isInteger(data?.Status) ||
        data.Question?.[0]?.name?.replace(/\.$/, '').toLowerCase() !== host ||
        data.Question?.[0]?.type !== type) return null;
    const records = data.Status === 0 && Array.isArray(data.Answer) ? data.Answer : [];
    const pattern = type === 1 ? /^(?:\d{1,3}\.){3}\d{1,3}$/ : /^[\da-f:]+$/i;
    const addresses = [...new Set(records.filter(record =>
      record?.type === type && typeof record.data === 'string' && pattern.test(record.data)
    ).map(record => record.data))];
    return { code: data.Status, addresses, authenticated: data.AD === true };
  } catch {
    return null;
  }
}

export async function checkDomain(report, signal, request = fetch) {
  const { host } = report;
  const [v4, v6, filtered] = await Promise.all([
    lookup(standardResolver, host, 1, signal, request),
    lookup(standardResolver, host, 28, signal, request),
    lookup(malwareResolver, host, 1, signal, request)
  ]);
  const routableV4 = v4?.addresses.filter(address => address !== '0.0.0.0') ?? [];
  const nonzeroV6 = v6?.addresses.filter(address => address !== '::') ?? [];
  const blockAddress = filtered?.addresses.includes('0.0.0.0');
  const blocked = Boolean(routableV4.length && blockAddress && filtered.addresses.every(address => address === '0.0.0.0'));
  const answers = [v4, v6];
  const resolved = Boolean(routableV4.length || nonzeroV6.length);
  const state = resolved ? 'dnsResolved' : answers.every(answer => answer?.code === 3) ? 'dnsMissing'
    : answers.every(answer => answer?.code === 0) ? 'dnsNoAddress' : 'dnsUnavailable';
  const filter = blocked ? 'filterBlocked'
    : filtered?.addresses.some(address => address !== '0.0.0.0') && !blockAddress ? 'filterClear' : 'filterUnknown';
  const authenticated = answers.filter(answer => answer?.addresses.length).length > 0 &&
    answers.filter(answer => answer?.addresses.length).every(answer => answer.authenticated);

  return { state, filter, authenticated, ipv4: routableV4.slice(0, 6), ipv6: nonzeroV6.slice(0, 6) };
}

export function verdict(report, dns) {
  if (dns?.filter === 'filterBlocked') return 'danger';
  if (report.signals.some(signal => signal.warning)) return 'suspicious';
  if (dns?.state === 'dnsResolved' && dns.filter === 'filterClear') return 'noWarning';
  return 'unknown';
}
