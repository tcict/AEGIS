import { extractLink, parseLink } from './link.mjs';

const copy = {
  ar: {
    eyebrow: 'حماية الروابط', title: 'فكّر قبل أن تضغط.',
    intro: 'افحص سمعة الرابط قبل فتحه، سواء وصلك في رسالة أو ظهر في صفحة.',
    scanner: 'ماسح الروابط', scanTitle: 'هل هذا الرابط موثوق؟', link: 'الرابط', submit: 'افحص الرابط',
    try: 'أمثلة المحاكاة', safe: 'آمن مبدئيًا', suspicious: 'مشبوه', danger: 'خطر', unknown: 'غير معروف',
    demo: 'وضع المحاكاة',
    privacyDemo: 'المحاكاة تجري داخل المتصفح، ولا ترسل الرابط إلى خادم.',
    demoSource: 'محاكاة تعليمية · لا تعكس سمعة الرابط الفعلية',
    no_match: 'لم يظهر الرابط في قوائم التهديد المفحوصة. تأكد من هوية الموقع قبل إدخال أي بيانات.',
    signals: 'صيغة النطاق تستدعي التحقق. راجع الرابط من مصدر موثوق قبل فتحه.',
    listed: 'تجنّب فتح الرابط أو إدخال بيانات فيه.',
    demo_only: 'هذا الرابط خارج أمثلة المحاكاة. يلزم اتصال بخدمة السمعة لتقييمه.',
    invalid: 'أدخل رابط HTTP أو HTTPS كاملًا باسم نطاق عام، مثل https://example.com.',
    shared: 'تم إدراج الرابط المشترك. راجعه قبل بدء الفحص.', badShare: 'تعذّر إدراج رابط صالح. يمكنك لصقه يدويًا.',
    feedKicker: 'تحديثات سحابية', feedTitle: 'تنبيهات الحماية', refresh: 'تحديث',
    feedLoading: 'جارٍ تحميل التنبيهات…', feedUnavailable: 'تعذّر الاتصال بتحديثات التنبيهات.',
    feedStale: 'تعذّر التحديث. تظهر آخر نسخة متاحة خلال هذه الجلسة.',
    feedVersion: 'مراجعة', noAdvisories: 'لا توجد تنبيهات في هذه المراجعة.',
    shareTitle: 'افحص من قائمة المشاركة',
    shareBody: 'اختر AEGIS إذا ظهر في قائمة المشاركة، ثم راجع الرابط واضغط «افحص الرابط». ويمكنك لصق الرابط هنا مباشرة.'
  },
  en: {
    eyebrow: 'LINK PROTECTION', title: 'Think before you click.',
    intro: 'Check a link’s reputation before you open it, wherever you found it.',
    scanner: 'LINK SCANNER', scanTitle: 'Can you trust this link?', link: 'Link', submit: 'Check link',
    try: 'Demo examples', safe: 'Provisionally safe', suspicious: 'Suspicious', danger: 'Dangerous', unknown: 'Unknown',
    demo: 'Simulation mode',
    privacyDemo: 'The simulation runs in your browser and sends no links to a server.',
    demoSource: 'Educational simulation · no real reputation assessment',
    no_match: 'The checked threat lists returned no match. Verify the site’s identity before entering any information.',
    signals: 'The domain format warrants a closer look. Verify it with a trusted source before opening it.',
    listed: 'Avoid opening the link or entering information on it.',
    demo_only: 'This link is outside the demo examples. A live reputation service is needed to assess it.',
    invalid: 'Enter a complete HTTP or HTTPS link with a public domain name, such as https://example.com.',
    shared: 'Shared link added. Review it before starting the scan.', badShare: 'A usable shared link could not be added. You can paste it here.',
    feedKicker: 'CLOUD UPDATES', feedTitle: 'Security advisories', refresh: 'Refresh',
    feedLoading: 'Loading advisories…', feedUnavailable: 'Could not reach the advisory service.',
    feedStale: 'Refresh failed. Showing the latest copy available in this session.',
    feedVersion: 'Revision', noAdvisories: 'There are no advisories in this revision.',
    shareTitle: 'Scan from the share sheet',
    shareBody: 'Choose AEGIS if it appears in your share sheet, review the link, then select Check link. You can also paste a link here.'
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

function renderResult() {
  const area = $('result');
  area.replaceChildren();
  area.dataset.status = result?.status ?? '';

  if (!result) return;
  if (result.message) {
    if (result.status) area.append(element('strong', t(result.status)));
    area.append(element('p', t(result.message)));
    return;
  }
  const host = element('bdi', result.host);
  host.dir = 'ltr';
  area.append(element('strong', t(result.status)), element('p', t(result.reason)));

  const attribution = element('p', t('demoSource'), 'source');
  attribution.append(' · ', host);
  area.append(attribution);
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
  $('locale').textContent = lang === 'ar' ? 'English' : 'العربية';
  $('locale').lang = lang === 'ar' ? 'en' : 'ar';
  for (const node of document.querySelectorAll('[data-t]')) node.textContent = t(node.dataset.t);
  $('mode').dataset.mode = 'demo';
  $('mode').textContent = t('demo');
  $('privacy').textContent = t('privacyDemo');
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

$('locale').addEventListener('click', () => {
  lang = lang === 'ar' ? 'en' : 'ar';
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
  $('scan').requestSubmit();
});
const examples = new Map([
  ['example.com', ['safe', 'no_match']],
  ['example.org', ['suspicious', 'signals']],
  ['example.net', ['danger', 'listed']]
]);

$('scan').addEventListener('submit', event => {
  event.preventDefault();
  resetScan();
  const url = parseLink(input.value);
  if (url) {
    const [status, reason] = examples.get(url.hostname) ?? ['unknown', 'demo_only'];
    result = { status, reason, host: url.hostname };
  } else {
    result = { message: 'invalid' };
  }
  render();
});

render();
void loadFeed();
void loadSiteContent();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js', { type: 'module' }).catch(() => {});
setInterval(() => { if (!document.hidden) void loadFeed(); }, 300_000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) void loadFeed(); });
