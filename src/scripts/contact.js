// Cloudflare does not rewrite application/json. Its initial-page decoder does
// not rerun for HTML inserted by our partial navigation, so restore only the
// site's explicitly marked contact links from the configured contact address.
export function hydrateContactLinks() {
  const data = document.getElementById('site-contact');
  if (!data) return;
  const { email } = JSON.parse(data.textContent);
  if (typeof email !== 'string' || !email) return;
  document.querySelectorAll('a[data-contact-email]').forEach(link => {
    link.setAttribute('href', `mailto:${email}`);
    if (link.hasAttribute('data-contact-display')) link.textContent = email;
  });
}
