const form = document.querySelector('#pickup');
const MAX_MAILTO = 1800;
let text = '';

document.querySelectorAll('[data-service]').forEach(a => a.addEventListener('click', () => {
  form.elements.service.value = a.dataset.service;
}));

function buildSummary(d, items) {
  return `NRG — Pickup planning summary\n\nService: ${d.get('service')}\nOrganization: ${d.get('company')}\nArea: ${d.get('area')}\nNeed it gone by: ${d.get('deadline') || 'Not specified'}\nBuilding access: ${d.get('access')}\nComputers (approx.): ${d.get('computers') || 'Not specified'}\nMonitors (approx.): ${d.get('monitors') || 'Not specified'}\n\nItems and quantities:\n${items}\n\nNext details to prepare: photos and pickup address. Remove hard drives/SSDs before pickup.\n\nThis request is not confirmed until NRG replies. Pickup and acceptance require confirmation.`;
}

function buildMailto(d) {
  const subject = `Pickup request - ${d.get('company')} - need by ${d.get('deadline') || 'flexible'}`;
  const make = items => `mailto:nrgrecovery@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildSummary(d, items) + '\n\nPhotos: (attach if available)')}`;
  let items = String(d.get('items'));
  let url = make(items);
  if (url.length > MAX_MAILTO) {
    const note = '… [list shortened — full list in the downloaded summary; please attach it]';
    let lo = 0, hi = items.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (make(items.slice(0, mid) + note).length <= MAX_MAILTO) lo = mid; else hi = mid - 1;
    }
    url = make(items.slice(0, lo) + note);
  }
  return url;
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const d = new FormData(form);
  text = buildSummary(d, d.get('items'));
  document.querySelector('#summary').textContent = text;
  document.querySelector('#email-request').href = buildMailto(d);
  const result = document.querySelector('#result');
  result.hidden = false;
  result.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest'});
});

document.querySelector('#download').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([text], {type: 'text/plain'}));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'NRG-pickup-summary.txt';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
