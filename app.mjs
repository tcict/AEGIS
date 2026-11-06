import { extractLink } from './link.mjs';
import { checkDomain, inspectLink, verdict } from './scan.mjs';

const copy = {
  ar: {
    language: 'لغة الواجهة',
    mode: "تحليل الرابط وفحص DNS",
    privacy: "يرسل فحص Cloudflare اسم النطاق فقط. التحليل المحلي لا يرسله. لا يفتح AEGIS الرابط.",
    submit: "افحص الرابط والنطاق",
    local: "تحليل محلي",
    try: "روابط للتجربة",
    sampleNormal: "نطاق عادي",
    sampleSuspicious: "معامل إعادة توجيه",
    sampleBlocked: "نطاق اختبار محجوب",
    suspicious: "مشبوه",
    danger: "خطر · النطاق محجوب",
    unknown: "غير معروف",
    noWarning: "لا تحذير ظاهر",
    checking: "جارٍ فحص النطاق…",
    dangerAdvice: "فلتر Cloudflare أعاد عنوان الحجب. تجنّب فتح الرابط.",
    suspiciousAdvice: "راجع الإشارات وتحقّق من العنوان من مصدر مستقل قبل فتحه.",
    unknownAdvice: "المعلومات المتاحة لا تكفي لتقييم السمعة.",
    noWarningAdvice: "لم يحجب الفلتر النطاق ولم تظهر إشارات تحذير في الصيغة. تحقّق من الموقع قبل إدخال بياناتك.",
    details: "تفاصيل الرابط",
    domain: "اسم النطاق",
    protocol: "البروتوكول",
    pathDepth: "أجزاء المسار",
    parameters: "المعاملات",
    fragment: "جزء بعد #",
    yes: "نعم",
    no: "لا",
    signals: "إشارات الرابط",
    none: "لا توجد إشارات ظاهرة في صيغة الرابط.",
    http: "الرابط يستخدم HTTP غير المشفّر.",
    idn: "النطاق يستخدم ترميز Punycode. راجع احتمال تشابه الأحرف.",
    shortener: "خدمة اختصار قد تخفي الوجهة النهائية.",
    redirect: "معامل يشير إلى وجهة خارجية محتملة",
    download: "امتداد في المسار قد يشغّل ملفًا أو يثبّت برنامجًا.",
    longHost: "النطاق متعدد الأجزاء. اقرأ العنوان كاملًا.",
    accountWords: "ظهر في الرابط لفظ مرتبط بالدخول أو الدفع.",
    sensitive: "أسماء معاملات قد تشير إلى بيانات حساسة. قيمها مخفية.",
    dns: "فحص النطاق · Cloudflare",
    dnsResolved: "أعاد DNS عنوانًا للنطاق.",
    dnsMissing: "النطاق غير موجود لدى محلّل Cloudflare (NXDOMAIN).",
    dnsNoAddress: "لم يُرجع DNS عنوان IPv4 أو IPv6.",
    dnsUnavailable: "تعذّر التحقق من DNS.",
    filterBlocked: "فلتر البرامج الخبيثة أعاد عنوان الحجب.",
    filterClear: "ردّ الفلتر بعنوان IPv4 بلا حجب.",
    filterUnknown: "لم يتسنَّ تأكيد حالة الحجب.",
    dnsLocal: "لم يُجرَ فحص DNS في التحليل المحلي.",
    dnssec: "تحقق DNSSEC للعناوين المعروضة",
    dnssecUnknown: "غير مؤكّد",
    limits: "التقرير لا يشمل محتوى الصفحة أو الوجهة النهائية أو شهادة TLS أو سمعة المسار الكامل.",
    eyebrow: 'حماية الروابط', title: 'فكّر قبل أن تضغط.',
    intro: 'افحص سمعة الرابط قبل فتحه، سواء وصلك في رسالة أو ظهر في صفحة.',
    scanner: 'ماسح الروابط', scanTitle: 'هل هذا الرابط موثوق؟', link: 'الرابط',
    invalid: 'أدخل رابط HTTP أو HTTPS كاملًا باسم نطاق عام، مثل https://example.com.',
    shared: 'تم إدراج الرابط المشترك. راجعه قبل بدء الفحص.', badShare: 'تعذّر إدراج رابط صالح. يمكنك لصقه يدويًا.',
    feedKicker: 'تحديثات سحابية', feedTitle: 'تنبيهات الحماية', refresh: 'تحديث',
    feedLoading: 'جارٍ تحميل التنبيهات…', feedUnavailable: 'تعذّر الاتصال بتحديثات التنبيهات.',
    feedStale: 'تعذّر التحديث. تظهر آخر نسخة متاحة خلال هذه الجلسة.',
    feedVersion: 'مراجعة', noAdvisories: 'لا توجد تنبيهات في هذه المراجعة.',
    shareTitle: 'افحص من قائمة المشاركة',
    shareBody: 'اختر AEGIS إذا ظهر في قائمة المشاركة، ثم راجع الرابط واضغط «افحص الرابط والنطاق». ويمكنك لصق الرابط هنا مباشرة.'
  },
  en: {
    language: 'Interface language',
    mode: "URL analysis and DNS checks",
    privacy: "Cloudflare receives only the hostname. Local analysis sends nothing. AEGIS never opens the URL.",
    submit: "Check link and domain",
    local: "Local analysis",
    try: "Try an example",
    sampleNormal: "Ordinary domain",
    sampleSuspicious: "Redirect parameter",
    sampleBlocked: "Blocked test domain",
    suspicious: "Suspicious",
    danger: "Danger · domain blocked",
    unknown: "Unknown",
    noWarning: "No warning observed",
    checking: "Checking domain…",
    dangerAdvice: "Cloudflare returned its block address. Avoid opening the link.",
    suspiciousAdvice: "Review the signals and verify the address independently.",
    unknownAdvice: "The available evidence is insufficient to assess reputation.",
    noWarningAdvice: "The filter did not block the domain and the format raised no warning. Verify the site before entering data.",
    details: "Link details",
    domain: "Hostname",
    protocol: "Protocol",
    pathDepth: "Path segments",
    parameters: "Query parameters",
    fragment: "Fragment after #",
    yes: "Yes",
    no: "No",
    signals: "URL signals",
    none: "No visible signals in the URL format.",
    http: "The link uses unencrypted HTTP.",
    idn: "The hostname uses Punycode. Check for lookalike characters.",
    shortener: "A shortening service may hide the final destination.",
    redirect: "A parameter points to a possible external destination",
    download: "A file extension in the path may execute or install software.",
    longHost: "The hostname has many parts. Read the full address.",
    accountWords: "The URL contains account or payment-related wording.",
    sensitive: "Parameter names suggest sensitive data. Their values are hidden.",
    dns: "Domain check · Cloudflare",
    dnsResolved: "DNS returned an address for the domain.",
    dnsMissing: "Cloudflare DNS returned NXDOMAIN.",
    dnsNoAddress: "DNS returned no IPv4 or IPv6 address.",
    dnsUnavailable: "DNS verification was unavailable.",
    filterBlocked: "The malware filter returned its block address.",
    filterClear: "The filter returned an IPv4 address without blocking.",
    filterUnknown: "Filtering status could not be confirmed.",
    dnsLocal: "DNS was not checked in local mode.",
    dnssec: "DNSSEC validation for shown addresses",
    dnssecUnknown: "Unconfirmed",
    limits: "This report does not inspect page content, final redirects, TLS certificates or full-path reputation.",
    eyebrow: 'LINK PROTECTION', title: 'Think before you click.',
    intro: 'Check a link’s reputation before you open it, wherever you found it.',
    scanner: 'LINK SCANNER', scanTitle: 'Can you trust this link?', link: 'Link',
    invalid: 'Enter a complete HTTP or HTTPS link with a public domain name, such as https://example.com.',
    shared: 'Shared link added. Review it before starting the scan.', badShare: 'A usable shared link could not be added. You can paste it here.',
    feedKicker: 'CLOUD UPDATES', feedTitle: 'Security advisories', refresh: 'Refresh',
    feedLoading: 'Loading advisories…', feedUnavailable: 'Could not reach the advisory service.',
    feedStale: 'Refresh failed. Showing the latest copy available in this session.',
    feedVersion: 'Revision', noAdvisories: 'There are no advisories in this revision.',
    shareTitle: 'Scan from the share sheet',
    shareBody: 'Choose AEGIS if it appears in your share sheet, review the link, then select Check link and domain. You can also paste a link here.'
  }
};

const $ = id => document.getElementById(id);
const input = $('url');
let lang = navigator.language?.startsWith('ar') ? 'ar' : 'en';
try {
  const stored = localStorage.getItem('aegis-language');
  if (stored === 'ar' || stored === 'en') lang = stored;
} catch {}
const editable = ['eyebrow', 'title', 'intro'];
const siteContent = {};
const t = key => siteContent[lang]?.[key] ?? copy[lang][key];

let result = null;
let pendingScan;
let intake = '';
let feed = null;
let feedStatus = 'loading';
let feedPending = false;

function element(tag, value, className = '') {
  const node = document.createElement(tag);
  node.textContent = value;
  if (className) node.className = className;
  return node;
}

function fact(list, label, value, ltr = false) {
  const detail = element('dd', value);
  if (ltr) detail.dir = 'ltr';
  list.append(element('dt', label), detail);
}

function renderResult() {
  const area = $('result');
  area.replaceChildren();
  area.dataset.status = result?.status ?? '';
  area.setAttribute('aria-busy', String(Boolean(result?.pending)));
  $('submit').disabled = Boolean(result?.pending);
  if (!result) return;
  if (!result.report) {
    area.append(element('p', t('invalid')));
    return;
  }
  const { status, report, dns, pending } = result;
  area.append(element('strong', t(pending ? 'checking' : status)));
  if (!pending) area.append(element('p', t(status + 'Advice')));

  const facts = element('dl', '', 'report-facts');
  const digits = new Intl.NumberFormat(lang);
  fact(facts, t('domain'), report.host, true);
  fact(facts, t('protocol'), report.protocol, true);
  fact(facts, t('pathDepth'), digits.format(report.pathDepth));
  fact(facts, t('parameters'), digits.format(report.parameters));
  fact(facts, t('fragment'), t(report.fragment ? 'yes' : 'no'));
  area.append(element('h3', t('details')), facts, element('h3', t('signals')));

  if (report.signals.length) {
    const list = element('ul', '', 'report-signals');
    for (const signal of report.signals) {
      const item = element('li', t(signal.id));
      if (signal.detail) {
        const host = element('bdi', signal.detail);
        host.dir = 'ltr';
        item.append(' · ', host);
      }
      if (signal.warning) item.dataset.warning = '';
      list.append(item);
    }
    area.append(list);
  } else {
    area.append(element('p', t('none')));
  }

  area.append(element('h3', t('dns')));
  if (dns) {
    area.append(element('p', t(dns.state)), element('p', t(dns.filter)));
    const addresses = element('dl', '', 'report-facts');
    if (dns.ipv4.length) fact(addresses, 'IPv4', dns.ipv4.join(' · '), true);
    if (dns.ipv6.length) fact(addresses, 'IPv6', dns.ipv6.join(' · '), true);
    if (addresses.childElementCount) {
      fact(addresses, t('dnssec'), t(dns.authenticated ? 'yes' : 'dnssecUnknown'));
      area.append(addresses);
    }
  } else if (!pending) {
    area.append(element('p', t('dnsLocal')));
  }
  area.append(element('p', t('limits'), 'source'));
}
function renderFeed() {
  const label = $('feed-state');
  const list = $('advisory-list');
  list.replaceChildren();
  if (!feed) {
    label.textContent = t(feedStatus === 'loading' ? 'feedLoading' : 'feedUnavailable');
    return;
  }
  const date = new Intl.DateTimeFormat(lang, { dateStyle: 'medium' }).format(new Date(feed.updatedAt));
  label.textContent = [t('feedVersion') + ' ' + feed.revision, date, feedStatus === 'stale' ? t('feedStale') : ''].filter(Boolean).join(' · ');
  if (!feed.advisories.length) list.append(element('p', t('noAdvisories'), 'micro'));
  for (const item of feed.advisories) {
    const card = element('article', '', 'advisory');
    card.dataset.severity = item.severity;
    card.append(element('h3', item.title[lang]), element('p', item.body[lang]));
    list.append(card);
  }
}

function render() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  $('locale').setAttribute('aria-label', t('language'));
  for (const button of $('locale').querySelectorAll('[data-lang]')) {
    button.setAttribute('aria-pressed', String(button.dataset.lang === lang));
  }
  for (const node of document.querySelectorAll('[data-t]')) node.textContent = t(node.dataset.t);
  $('mode').textContent = t('mode');
  $('privacy').textContent = t('privacy');
  $('examples').hidden = false;
  $('intake').hidden = !intake;
  $('intake').textContent = intake ? t(intake) : '';
  renderResult();
  renderFeed();
}

async function loadSiteContent() {
  try {
    const response = await fetch('./site-content.json', { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return;
    const data = await response.json();
    for (const language of ['ar', 'en']) {
      const values = {};
      for (const key of editable) {
        const value = data?.[language]?.[key];
        if (typeof value === 'string' && value.trim() && value.length <= 240) values[key] = value.trim();
      }
      siteContent[language] = values;
    }
    render();
  } catch {
    // Keep the default text if the optional content is unavailable.
  }
}

async function loadFeed() {
  if (feedPending) return;
  feedPending = true;
  $('refresh').disabled = true;
  try {
    const response = await fetch('./advisories.json', { cache: 'no-cache', signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error('Feed unavailable');
    feed = await response.json();
    feedStatus = 'ready';
  } catch {
    feedStatus = feed ? 'stale' : 'unavailable';
  } finally {
    feedPending = false;
    $('refresh').disabled = false;
    renderFeed();
  }
}

function resetScan() {
  pendingScan?.abort();
  pendingScan = undefined;
  result = null;
  intake = '';
}

function receiveShare(text) {
  const link = extractLink(text);
  resetScan();
  if (link) input.value = link;
  intake = link ? 'shared' : 'badShare';
  render();
  return true;
}

// Allow native wrappers to place a shared link in the input.
window.aegisReceiveShare = receiveShare;
if (location.hash.startsWith('#share')) {
  const fragment = location.hash;
  history.replaceState(null, '', location.pathname + location.search);
  try {
    receiveShare(fragment.startsWith('#shared=') ? decodeURIComponent(fragment.slice(8)) : '');
  } catch {
    receiveShare('');
  }
}

$('locale').addEventListener('click', event => {
  const selected = event.target.closest('button[data-lang]')?.dataset.lang;
  if (!selected || selected === lang) return;
  lang = selected;
  try { localStorage.setItem('aegis-language', lang); } catch {}
  render();
});
input.addEventListener('input', () => {
  resetScan();
  render();
});
$('refresh').addEventListener('click', loadFeed);
$('examples').addEventListener('click', event => {
  if (!event.target.dataset.sample) return;
  resetScan();
  input.value = event.target.dataset.sample;
  render();
  input.focus();
});
$('scan').addEventListener('submit', async event => {
  event.preventDefault();
  resetScan();
  const report = inspectLink(input.value);
  if (!report) {
    result = {};
    render();
    return;
  }

  const online = event.submitter?.id !== 'local';
  result = { report, status: verdict(report), pending: online };
  render();
  if (!online) return;

  const controller = new AbortController();
  pendingScan = controller;
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const dns = await checkDomain(report, controller.signal);
    if (pendingScan !== controller) return;
    result = { report, status: verdict(report, dns), dns };
    render();
  } finally {
    clearTimeout(timeout);
    if (pendingScan === controller) pendingScan = undefined;
  }
});

render();
void loadFeed();
void loadSiteContent();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js', { type: 'module' }).catch(() => {});
setInterval(() => { if (!document.hidden) void loadFeed(); }, 300_000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) void loadFeed(); });
