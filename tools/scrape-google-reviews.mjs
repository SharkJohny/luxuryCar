import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';

const PLACE = process.env.PLACE || 'Luxury Car Design Žilina';
const SHOT = (n) => `tools/_scrape-${n}.png`;
const log = (...a) => console.log('[scrape]', ...a);

const b = await chromium.launch({ headless: false });
const pg = await b.newPage({ locale: 'sk-SK', viewport: { width: 1280, height: 900 } });

try {
  log('PLACE =', PLACE);
  await pg.goto('https://www.google.com/maps/search/' + encodeURIComponent(PLACE), { waitUntil: 'domcontentloaded' });
  await pg.waitForTimeout(3000);

  // cookies consent (rôzne varianty)
  for (const sel of ['button[aria-label*="Prijať"]', 'button[aria-label*="Accept all"]', 'button[aria-label*="Súhlasím"]', 'form[action*="consent"] button']) {
    try { const el = await pg.$(sel); if (el) { await el.click(); log('cookies klik:', sel); await pg.waitForTimeout(1500); break; } } catch {}
  }
  await pg.screenshot({ path: SHOT('1-afterload'), fullPage: false });

  // ak je zoznam výsledkov, otvor prvý
  try {
    const first = await pg.$('a.hfpxzc');
    if (first) { await first.click(); log('klik na prvý výsledok'); await pg.waitForTimeout(3000); }
    else log('žiadny a.hfpxzc — asi sme rovno na profile');
  } catch (e) { log('first-result chyba', e.message); }
  await pg.screenshot({ path: SHOT('2-profile') });

  // záložka Recenzie
  let tabClicked = false;
  for (const sel of ['button[role="tab"][aria-label*="ecenz"]', 'button[aria-label*="Reviews"]', 'button[jsaction*="reviewChart"]', 'button:has-text("Recenzie")']) {
    try { const el = await pg.$(sel); if (el) { await el.click(); tabClicked = true; log('recenzie tab:', sel); await pg.waitForTimeout(3000); break; } } catch {}
  }
  if (!tabClicked) log('!! recenzie tab nenájdený');
  await pg.screenshot({ path: SHOT('3-reviews-tab') });

  // scroll panel recenzií
  let last = 0, stable = 0;
  for (let i = 0; i < 120; i++) {
    await pg.mouse.wheel(0, 3000);
    await pg.waitForTimeout(800);
    const n = await pg.$$eval('div[data-review-id]', els => els.length).catch(() => 0);
    if (n === last) { stable++; if (stable > 6 && i > 8) { log('scroll stabilný na', n); break; } }
    else { stable = 0; last = n; }
    if (i % 10 === 0) log(`scroll ${i}: ${n} recenzií`);
  }
  await pg.screenshot({ path: SHOT('4-scrolled') });

  // rozbaľ "Viac"
  try {
    await pg.$$eval('button[aria-label="Zobraziť viac"], button[aria-label="See more"], button[jsaction*="review.expandReview"]', bs => bs.forEach(x => x.click()));
    await pg.waitForTimeout(1500);
  } catch (e) { log('expand chyba', e.message); }

  const reviews = await pg.$$eval('div[data-review-id]', cards => cards.map(c => {
    const author = (c.querySelector('.d4r55, [class*="fontTitleMedium"]')?.textContent || '').trim();
    const text = (c.querySelector('.wiI7pd, [class*="fontBodyMedium"] span')?.textContent || '').trim();
    const photos = [...c.querySelectorAll('button[style*="googleusercontent"], button[data-photo-index]')]
      .map(b => {
        const m = (b.getAttribute('style') || '').match(/url\("?(https:[^"\)]+)"?\)/);
        return m ? m[1].replace(/=w\d+-h\d+.*$/, '=s700').replace(/=s\d+.*$/, '=s700') : null;
      })
      .filter(Boolean);
    return { author, text, photos };
  }));

  const withPhotos = reviews.filter(r => r.photos.length);
  await writeFile('tools/google-reviews-fresh.json', JSON.stringify(reviews, null, 2));
  log(`HOTOVO — recenzií: ${reviews.length} | s fotkami: ${withPhotos.length} | spolu fotiek: ${reviews.reduce((s, r) => s + r.photos.length, 0)}`);
  if (reviews.length === 0) log('!! 0 recenzií — pozri tools/_scrape-*.png na diagnostiku DOM');
} catch (e) {
  log('FATAL', e.message);
  try { await pg.screenshot({ path: SHOT('FATAL') }); } catch {}
} finally {
  await pg.waitForTimeout(1000);
  await b.close();
}
