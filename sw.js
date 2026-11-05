import { extractLink } from './link.mjs';

self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', event => {
  const target = new URL("share", self.registration.scope);
  if (event.request.method !== 'POST' || event.request.url !== target.href) return;
  event.respondWith(redirectToScanner(event.request));
});

async function redirectToScanner(request) {
  let fragment = '#share-unavailable';
  try {
    const form = await request.formData();
    const link = extractLink(form.get('url')) || extractLink(form.get('text'));
    fragment = link ? '#shared=' + encodeURIComponent(link) : '#share-invalid';
  } catch {
    // Malformed submissions leave the input empty.
  }
  return Response.redirect(new URL(fragment, self.registration.scope), 303);
}
