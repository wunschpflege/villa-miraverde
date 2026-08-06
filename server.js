const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
 
const app = express();
const PORT = process.env.PORT || 3000;

// ── SICHERHEIT: Secret & Admin-Passwort NUR aus Umgebungsvariablen ──
// Kein fester Fallback mehr im Code. Fehlt JWT_SECRET, wird pro Start ein
// zufälliges Secret erzeugt (bestehende Logins werden dann ungültig).
const JWT_SECRET = process.env.JWT_SECRET || require('crypto').randomBytes(48).toString('hex');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || null;
if (!process.env.JWT_SECRET) console.warn('⚠️  JWT_SECRET nicht gesetzt – es wird ein zufälliges Secret verwendet (Logins gehen bei jedem Neustart verloren). Bitte in Railway setzen.');
if (!ADMIN_PASSWORD) console.warn('⚠️  ADMIN_PASSWORD nicht gesetzt – der Admin-Login ist deaktiviert, bis die Variable in Railway gesetzt ist.');
 
// Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
 
// Middleware
app.use(express.json());
 
// ── KEIN CACHING für HTML/JS/CSS (immer aktuelle Version ausliefern) ──
app.use((req, res, next) => {
  var p = req.path;
  if (p.endsWith('.html') || p.endsWith('.js') || p.endsWith('.css') || p === '/' || p === '/admin') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});
 
app.use(express.static(path.join(__dirname)));
 
// ── DB SETUP ──
async function setupDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        country VARCHAR(100),
        date VARCHAR(50),
        rating INTEGER NOT NULL DEFAULT 5,
        text TEXT NOT NULL,
        approved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
 
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        firstname VARCHAR(100),
        lastname VARCHAR(100),
        email VARCHAR(200),
        phone VARCHAR(50),
        checkin DATE,
        checkout DATE,
        guests INTEGER,
        message TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );
 
      CREATE TABLE IF NOT EXISTS blocked_dates (
        id SERIAL PRIMARY KEY,
        date_from DATE NOT NULL,
        date_to DATE NOT NULL,
        label VARCHAR(200),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120),
        email VARCHAR(200) NOT NULL UNIQUE,
        lang VARCHAR(10),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS pageviews (
        id SERIAL PRIMARY KEY,
        tab VARCHAR(40),
        lang VARCHAR(10),
        ref VARCHAR(120),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS weekly_report_log (
        week_start DATE PRIMARY KEY,
        sent_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(60) PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    // Gerätetyp-Spalte ergänzen (anonym: mobile/desktop/tablet)
    await pool.query("ALTER TABLE pageviews ADD COLUMN IF NOT EXISTS device VARCHAR(10)");
    // Empfohlene Startpreise einmalig hinterlegen (spätere eigene Änderungen bleiben erhalten)
    await pool.query(
      "INSERT INTO settings (key, value) VALUES ('prices', $1) ON CONFLICT (key) DO NOTHING",
      [JSON.stringify(DEFAULT_PRICES)]
    );
    // Einmalige Umstellung: Endreinigung separat ausweisen statt "inklusive"
    var mig = await pool.query("SELECT 1 FROM settings WHERE key='mig_cleaning_charged'");
    if (mig.rows.length === 0) {
      await pool.query("UPDATE settings SET value = (value::jsonb || '{\"cleaningIncluded\":false,\"cleaning\":150}'::jsonb)::text WHERE key='prices'");
      await pool.query("INSERT INTO settings (key, value) VALUES ('mig_cleaning_charged','1') ON CONFLICT (key) DO NOTHING");
    }
    // Diagnose-/Test-Eintraege aus der Statistik entfernen (aus der Fehlersuche).
    await pool.query("DELETE FROM pageviews WHERE tab='ping' OR ref='diagnose'");
    console.log('✅ Database tables ready');
  } catch(err) {
    console.error('DB setup error:', err.message);
  }
}
 
// ── AUTH MIDDLEWARE ──
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Nicht autorisiert' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token ungültig' });
  }
}
 
// ── E-MAIL-BENACHRICHTIGUNG BEI NEUER BUCHUNG ──
// Konfiguration über Umgebungsvariablen (Railway):
//   SMTP_HOST, SMTP_PORT (z.B. 587), SMTP_USER, SMTP_PASS,
//   BOOKING_NOTIFY_TO   (Empfänger, z.B. a.markus@wunschpflege.de)
//   BOOKING_NOTIFY_FROM (Absender, Standard = SMTP_USER)
// Ist nichts konfiguriert, wird die Mail lautlos übersprungen.
let mailTransport = null;
function getMailTransport() {
  if (mailTransport) return mailTransport;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  try {
    const nodemailer = require('nodemailer');
    mailTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true' || parseInt(process.env.SMTP_PORT || '587', 10) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    return mailTransport;
  } catch (err) {
    console.warn('⚠️  E-Mail-Versand nicht möglich (nodemailer fehlt?):', err.message);
    return null;
  }
}

async function sendWaitlistNotification(w) {
  const transport = getMailTransport();
  const to = process.env.BOOKING_NOTIFY_TO;
  if (!transport || !to) return; // nicht konfiguriert -> überspringen
  const esc = (v) => String(v == null ? '' : v).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
  try {
    await transport.sendMail({
      from: process.env.BOOKING_NOTIFY_FROM || process.env.SMTP_USER,
      to,
      replyTo: w.email || undefined,
      subject: `🔔 Neue Warteliste-Anmeldung – ${w.email}`,
      html: `
        <h2>Neue Warteliste-Anmeldung – Villa Las Hermanas</h2>
        <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif">
          <tr><td><b>Name</b></td><td>${esc(w.name)}</td></tr>
          <tr><td><b>E-Mail</b></td><td>${esc(w.email)}</td></tr>
          <tr><td><b>Sprache</b></td><td>${esc(w.lang)}</td></tr>
        </table>
        <p style="color:#888;font-size:12px">Interessent:in möchte benachrichtigt werden, sobald die Villa buchbar ist.</p>`,
    });
  } catch (err) {
    console.error('E-Mail-Versand (Warteliste) fehlgeschlagen:', err.message);
  }
}

async function sendBookingNotification(b) {
  const transport = getMailTransport();
  const to = process.env.BOOKING_NOTIFY_TO;
  if (!transport || !to) return; // nicht konfiguriert -> überspringen
  const esc = (v) => String(v == null ? '' : v).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
  const name = `${b.firstname || ''} ${b.lastname || ''}`.trim() || '(ohne Namen)';
  try {
    await transport.sendMail({
      from: process.env.BOOKING_NOTIFY_FROM || process.env.SMTP_USER,
      to,
      replyTo: b.email || undefined,
      subject: `🏠 Neue Buchungsanfrage – ${name} (${b.checkin} → ${b.checkout})`,
      html: `
        <h2>Neue Buchungsanfrage – Villa Las Hermanas</h2>
        <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif">
          <tr><td><b>Name</b></td><td>${esc(name)}</td></tr>
          <tr><td><b>E-Mail</b></td><td>${esc(b.email)}</td></tr>
          <tr><td><b>Telefon</b></td><td>${esc(b.phone)}</td></tr>
          <tr><td><b>Anreise</b></td><td>${esc(b.checkin)}</td></tr>
          <tr><td><b>Abreise</b></td><td>${esc(b.checkout)}</td></tr>
          <tr><td><b>Gäste</b></td><td>${esc(b.guests)}</td></tr>
          <tr><td><b>Nachricht</b></td><td>${esc(b.message)}</td></tr>
        </table>
        <p style="color:#888;font-size:12px">Verwalten im Admin-Bereich: /admin</p>`,
    });
  } catch (err) {
    console.error('E-Mail-Versand fehlgeschlagen:', err.message);
  }
}

// ── WÖCHENTLICHE ZUSAMMENFASSUNG PER E-MAIL (jeden Montag) ──
const WR_TABS = { start: 'Startseite', ausstattung: 'Ausstattung', buchen: 'Buchen', empfehlungen: 'Empfehlungen', 'ueber-uns': 'Über uns', lage: 'Lage & Kontakt', gaestebuch: 'Gästebuch' };
const WR_DEV = { mobile: 'Handy', desktop: 'Computer', tablet: 'Tablet', '?': 'Unbekannt' };

async function buildWeeklyReport() {
  async function num(sql) { try { return (await pool.query(sql)).rows[0].c; } catch (e) { return 0; } }
  async function rows(sql) { try { return (await pool.query(sql)).rows; } catch (e) { return []; } }
  var v7 = await num("SELECT COUNT(*)::int c FROM pageviews WHERE created_at > NOW() - INTERVAL '7 days'");
  var vPrev = await num("SELECT COUNT(*)::int c FROM pageviews WHERE created_at > NOW() - INTERVAL '14 days' AND created_at <= NOW() - INTERVAL '7 days'");
  var wl7 = await num("SELECT COUNT(*)::int c FROM waitlist WHERE created_at > NOW() - INTERVAL '7 days'");
  var bk7 = await num("SELECT COUNT(*)::int c FROM bookings WHERE created_at > NOW() - INTERVAL '7 days'");
  var topTabs = await rows("SELECT COALESCE(NULLIF(tab,''),'?') tab, COUNT(*)::int c FROM pageviews WHERE created_at > NOW() - INTERVAL '7 days' GROUP BY 1 ORDER BY c DESC LIMIT 5");
  var topRefs = await rows("SELECT COALESCE(NULLIF(ref,''),'Direkt') ref, COUNT(*)::int c FROM pageviews WHERE created_at > NOW() - INTERVAL '7 days' GROUP BY 1 ORDER BY c DESC LIMIT 5");
  var dev = await rows("SELECT COALESCE(NULLIF(device,''),'?') device, COUNT(*)::int c FROM pageviews WHERE created_at > NOW() - INTERVAL '7 days' GROUP BY 1 ORDER BY c DESC");
  return { v7, vPrev, wl7, bk7, topTabs, topRefs, dev };
}

async function sendWeeklyReport() {
  const transport = getMailTransport();
  const to = process.env.BOOKING_NOTIFY_TO;
  if (!transport || !to) return false;
  const r = await buildWeeklyReport();
  const diff = r.v7 - r.vPrev;
  const trend = r.vPrev === 0 ? (r.v7 > 0 ? '▲ neu' : '–') : (diff > 0 ? '▲ +' + diff : diff < 0 ? '▼ ' + diff : '± 0') + ' ggü. Vorwoche';
  const li = (arr, keyName, map) => (arr && arr.length)
    ? '<ul style="margin:.3rem 0 .8rem;padding-left:1.1rem;color:#333">' + arr.map(x => '<li>' + ((map && map[x[keyName]]) || x[keyName]) + ' – <b>' + x.c + '</b></li>').join('') + '</ul>'
    : '<p style="color:#888;margin:.3rem 0 .8rem">Keine Daten.</p>';
  try {
    await transport.sendMail({
      from: process.env.BOOKING_NOTIFY_FROM || process.env.SMTP_USER,
      to,
      subject: `📊 Wochenrückblick Villa Las Hermanas – ${r.v7} Aufrufe`,
      html: `
        <div style="font-family:sans-serif;max-width:600px">
          <h2 style="color:#2a6b6b">📊 Dein Wochenrückblick</h2>
          <p>Hier die Zahlen der letzten 7 Tage für <b>Villa Las Hermanas</b>:</p>
          <table cellpadding="8" style="border-collapse:collapse;font-size:15px">
            <tr><td>👀 <b>Seitenaufrufe</b></td><td><b>${r.v7}</b> <span style="color:#888">(${trend})</span></td></tr>
            <tr><td>📝 <b>Neue Warteliste-Einträge</b></td><td><b>${r.wl7}</b></td></tr>
            <tr><td>🏠 <b>Neue Buchungsanfragen</b></td><td><b>${r.bk7}</b></td></tr>
          </table>
          <h3 style="color:#2a6b6b;margin-top:1.2rem">Beliebteste Bereiche</h3>
          ${li(r.topTabs, 'tab', WR_TABS)}
          <h3 style="color:#2a6b6b">Woher die Besucher kamen</h3>
          ${li(r.topRefs, 'ref', null)}
          <h3 style="color:#2a6b6b">Geräte</h3>
          ${li(r.dev, 'device', WR_DEV)}
          <p style="color:#888;font-size:12px;margin-top:1.4rem">Alle Details jederzeit im Admin-Bereich unter „Statistik". Anonyme Auswertung – ohne Cookies, ohne persönliche Daten.</p>
        </div>`,
    });
    return true;
  } catch (err) {
    console.error('Wochenbericht-Versand fehlgeschlagen:', err.message);
    return false;
  }
}

// Zeitplaner: montags ab 8 Uhr (spanische Ortszeit) einmal pro Woche senden.
function madridInfo() {
  var parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', hour12: false }).formatToParts(new Date());
  var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
  return { date: o.year + '-' + o.month + '-' + o.day, weekday: o.weekday, hour: parseInt(o.hour, 10) || 0 };
}
async function maybeSendWeekly() {
  try {
    if (!process.env.SMTP_HOST || !process.env.BOOKING_NOTIFY_TO) return;
    var info = madridInfo();
    if (info.weekday !== 'Mon' || info.hour < 8) return; // nur montags ab 8 Uhr
    var ins = await pool.query("INSERT INTO weekly_report_log (week_start) VALUES ($1) ON CONFLICT (week_start) DO NOTHING RETURNING week_start", [info.date]);
    if (ins.rowCount === 0) return; // diese Woche bereits gesendet
    var ok = await sendWeeklyReport();
    console.log(ok ? '📊 Wochenbericht gesendet für Woche ' + info.date : '⚠️  Wochenbericht konnte nicht gesendet werden');
  } catch (e) { console.error('Wochenbericht-Scheduler:', e.message); }
}
setInterval(maybeSendWeekly, 30 * 60 * 1000); // alle 30 Minuten prüfen
setTimeout(maybeSendWeekly, 20000);           // kurz nach Start einmal prüfen

// Manuelles Auslösen (Test) aus dem Admin heraus
app.post('/api/admin/weekly-report/test', authMiddleware, async (req, res) => {
  var ok = await sendWeeklyReport();
  res.json({ ok });
});

// ── AUTH ROUTES ──
// ── LOGIN mit einfachem Rate-Limiting (Brute-Force-Schutz, ohne Zusatzpaket) ──
const loginAttempts = new Map(); // ip -> { count, first }
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000; // 15 Minuten

// Benachrichtigung per E-Mail bei Login bzw. mehreren Fehlversuchen (fail-soft, blockiert den Login nie)
async function sendLoginAlert(kind, ip, ua) {
  const transport = getMailTransport();
  const to = process.env.BOOKING_NOTIFY_TO;
  if (!transport || !to) return;
  const esc = (v) => String(v == null ? '' : v).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
  let when;
  try { when = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Madrid', dateStyle: 'medium', timeStyle: 'short' }).format(new Date()); } catch (e) { when = new Date().toISOString(); }
  const success = kind === 'success';
  const subject = success ? '🔓 Admin-Login bei Villa Las Hermanas' : '⚠️ Fehlgeschlagene Admin-Login-Versuche';
  const intro = success
    ? 'Es hat sich gerade jemand erfolgreich im Admin-Bereich angemeldet.'
    : 'Es gab mehrere fehlgeschlagene Anmeldeversuche im Admin-Bereich – der Zugang wurde für 15 Minuten gesperrt. Falls du das nicht warst, ändere zur Sicherheit dein Passwort in Railway.';
  try {
    await transport.sendMail({
      from: process.env.BOOKING_NOTIFY_FROM || process.env.SMTP_USER,
      to,
      subject,
      html: `<div style="font-family:sans-serif;max-width:560px">
        <h2 style="color:${success ? '#2a6b6b' : '#C0392B'}">${subject}</h2>
        <p>${intro}</p>
        <table cellpadding="6" style="border-collapse:collapse;font-size:14px">
          <tr><td><b>Zeitpunkt</b></td><td>${esc(when)} (Spanien)</td></tr>
          <tr><td><b>IP-Adresse</b></td><td>${esc(ip)}</td></tr>
          <tr><td><b>Gerät / Browser</b></td><td>${esc(ua)}</td></tr>
        </table>
        <p style="color:#888;font-size:12px">War das dein eigener Login, kannst du diese E-Mail einfach ignorieren.</p>
      </div>`,
    });
  } catch (err) { console.error('Login-Benachrichtigung fehlgeschlagen:', err.message); }
}

app.post('/api/login', async (req, res) => {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || 'unknown';
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (entry && now - entry.first > WINDOW_MS) loginAttempts.delete(ip);
  const current = loginAttempts.get(ip);
  if (current && current.count >= MAX_ATTEMPTS) {
    return res.status(429).json({ error: 'Zu viele Versuche. Bitte in 15 Minuten erneut versuchen.' });
  }

  const { password } = req.body;
  if (!ADMIN_PASSWORD) {
    return res.status(503).json({ error: 'Admin-Login ist nicht konfiguriert.' });
  }
  var ua = String(req.headers['user-agent'] || '').slice(0, 200);
  if (password === ADMIN_PASSWORD) {
    loginAttempts.delete(ip);
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token });
    sendLoginAlert('success', ip, ua); // im Hintergrund, ohne den Login zu verzögern
  } else {
    const rec = loginAttempts.get(ip) || { count: 0, first: now };
    rec.count += 1;
    loginAttempts.set(ip, rec);
    if (rec.count === MAX_ATTEMPTS) sendLoginAlert('failed', ip, ua); // einmalig beim Erreichen der Sperre
    res.status(401).json({ error: 'Falsches Passwort' });
  }
});
 
// ── REVIEWS PUBLIC ──
app.get('/api/reviews', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, country, date, rating, text FROM reviews WHERE approved = true ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});
 
app.post('/api/reviews', async (req, res) => {
  const { name, country, date, rating, text } = req.body;
  if (!name || !text || !rating) return res.status(400).json({ error: 'Pflichtfelder fehlen' });
  try {
    await pool.query(
      'INSERT INTO reviews (name, country, date, rating, text) VALUES ($1,$2,$3,$4,$5)',
      [name, country || '', date || new Date().toLocaleDateString('de-DE', {month:'long',year:'numeric'}), rating, text]
    );
    res.json({ success: true, message: 'Vielen Dank! Ihre Bewertung wird nach Prüfung veröffentlicht.' });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});
 
// ── REVIEWS ADMIN ──
app.get('/api/admin/reviews', authMiddleware, async (req, res) => {
  const result = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
  res.json(result.rows);
});
 
app.patch('/api/admin/reviews/:id', authMiddleware, async (req, res) => {
  const { approved } = req.body;
  await pool.query('UPDATE reviews SET approved=$1 WHERE id=$2', [approved, req.params.id]);
  res.json({ success: true });
});
 
app.delete('/api/admin/reviews/:id', authMiddleware, async (req, res) => {
  await pool.query('DELETE FROM reviews WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});
 
// ── BOOKINGS PUBLIC ──
app.post('/api/bookings', async (req, res) => {
  const { firstname, lastname, email, phone, checkin, checkout, guests, message } = req.body;
  if (!email || !checkin || !checkout) return res.status(400).json({ error: 'Pflichtfelder fehlen' });
  try {
    await pool.query(
      'INSERT INTO bookings (firstname,lastname,email,phone,checkin,checkout,guests,message) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [firstname, lastname, email, phone, checkin, checkout, guests || 2, message]
    );
    res.json({ success: true });
    // Benachrichtigung im Hintergrund senden (blockiert die Antwort nicht)
    sendBookingNotification({ firstname, lastname, email, phone, checkin, checkout, guests: guests || 2, message });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});
 
// ── BOOKINGS ADMIN ──
app.get('/api/admin/bookings', authMiddleware, async (req, res) => {
  const result = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
  res.json(result.rows);
});
 
app.patch('/api/admin/bookings/:id', authMiddleware, async (req, res) => {
  const { status } = req.body;
  await pool.query('UPDATE bookings SET status=$1 WHERE id=$2', [status, req.params.id]);
  res.json({ success: true });
});
 
app.delete('/api/admin/bookings/:id', authMiddleware, async (req, res) => {
  await pool.query('DELETE FROM bookings WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});
 
// ── WARTELISTE (Vormerkung bis Vermietungsstart) ──
app.post('/api/waitlist', async (req, res) => {
  const { name, email, lang } = req.body;
  const mail = (email || '').trim();
  if (!mail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
    return res.status(400).json({ error: 'Bitte eine gültige E-Mail-Adresse angeben.' });
  }
  try {
    await pool.query(
      `INSERT INTO waitlist (name, email, lang) VALUES ($1,$2,$3)
       ON CONFLICT (email) DO UPDATE SET name = COALESCE(NULLIF(EXCLUDED.name,''), waitlist.name)`,
      [(name || '').trim(), mail, (lang || '').slice(0, 10)]
    );
    res.json({ success: true });
    sendWaitlistNotification({ name, email: mail, lang }); // Hintergrund
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/waitlist', authMiddleware, async (req, res) => {
  const result = await pool.query('SELECT * FROM waitlist ORDER BY created_at DESC');
  res.json(result.rows);
});

// ── EIGENE STATISTIK (cookiefrei, keine IP/Personendaten) ──
// Zählung per GET (robust, kein Body-Parsing nötig).
// ?ping=1 = reiner Lese-Statuscheck (schreibt KEINE Zeile, verschmutzt die Statistik nicht).
app.get('/api/visit', async (req, res) => {
  try {
    var isPing = !!req.query.ping;
    var tab = String(req.query.tab || '').slice(0, 40);
    var lang = String(req.query.lang || '').slice(0, 10);
    var ref = String(req.query.ref || '').slice(0, 120);
    var device = String(req.query.dev || '').slice(0, 10);
    if (device && ['mobile', 'desktop', 'tablet'].indexOf(device) === -1) device = '';
    if (tab && !isPing) await pool.query('INSERT INTO pageviews (tab, lang, ref, device) VALUES ($1,$2,$3,$4)', [tab, lang, ref, device]);
    var total = (await pool.query('SELECT COUNT(*)::int c FROM pageviews')).rows[0].c;
    res.json({ ok: true, total: total });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/visit', async (req, res) => {
  try {
    var b = req.body || {};
    var tab = String(b.tab || '').slice(0, 40);
    var lang = String(b.lang || '').slice(0, 10);
    var ref = String(b.ref || '').slice(0, 120);
    if (tab) await pool.query('INSERT INTO pageviews (tab, lang, ref) VALUES ($1,$2,$3)', [tab, lang, ref]);
    res.json({ ok: true });
  } catch (e) { res.json({ ok: false }); } // niemals den Besucher stören
});

app.get('/api/admin/stats', authMiddleware, async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  // Jede Teil-Abfrage einzeln absichern: scheitert eine, brechen nicht alle
  // Zahlen weg – die restlichen Werte werden trotzdem geliefert.
  async function num(sql, def) { try { return (await pool.query(sql)).rows[0].c; } catch (e) { return def === undefined ? 0 : def; } }
  async function rows(sql) { try { return (await pool.query(sql)).rows; } catch (e) { return []; } }
  var total = await num("SELECT COUNT(*)::int c FROM pageviews");
  var last7 = await num("SELECT COUNT(*)::int c FROM pageviews WHERE created_at > NOW() - INTERVAL '7 days'");
  var last30 = await num("SELECT COUNT(*)::int c FROM pageviews WHERE created_at > NOW() - INTERVAL '30 days'");
  var byTab = await rows("SELECT COALESCE(NULLIF(tab,''),'?') tab, COUNT(*)::int c FROM pageviews GROUP BY 1 ORDER BY c DESC LIMIT 12");
  var byLang = await rows("SELECT COALESCE(NULLIF(lang,''),'?') lang, COUNT(*)::int c FROM pageviews GROUP BY 1 ORDER BY c DESC LIMIT 12");
  var byRef = await rows("SELECT COALESCE(NULLIF(ref,''),'Direkt') ref, COUNT(*)::int c FROM pageviews GROUP BY 1 ORDER BY c DESC LIMIT 10");
  var byDay = await rows("SELECT to_char(created_at::date,'YYYY-MM-DD') AS d, COUNT(*)::int c FROM pageviews WHERE created_at > NOW() - INTERVAL '14 days' GROUP BY 1 ORDER BY 1");
  var waitlist = await num("SELECT COUNT(*)::int c FROM waitlist");
  var bookings = await num("SELECT COUNT(*)::int c FROM bookings");
  // Geräte-Übersicht (anonym)
  var byDevice = await rows("SELECT COALESCE(NULLIF(device,''),'?') device, COUNT(*)::int c FROM pageviews GROUP BY 1 ORDER BY c DESC");
  // Aktivität nach Wochentag (0=So..6=Sa) und Uhrzeit (0..23), in spanischer Ortszeit
  var byDow = await rows("SELECT EXTRACT(DOW FROM created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Madrid')::int dow, COUNT(*)::int c FROM pageviews GROUP BY 1 ORDER BY 1");
  var byHour = await rows("SELECT EXTRACT(HOUR FROM created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Madrid')::int hr, COUNT(*)::int c FROM pageviews GROUP BY 1 ORDER BY 1");
  // 7-Tage-Verlauf für Sprache & Herkunft (als Objekt {schluessel: anzahl})
  var byLang7 = await rows("SELECT COALESCE(NULLIF(lang,''),'?') lang, COUNT(*)::int c FROM pageviews WHERE created_at > NOW() - INTERVAL '7 days' GROUP BY 1");
  var byRef7 = await rows("SELECT COALESCE(NULLIF(ref,''),'Direkt') ref, COUNT(*)::int c FROM pageviews WHERE created_at > NOW() - INTERVAL '7 days' GROUP BY 1");
  function toMap(arr, key) { var o = {}; (arr || []).forEach(function (r) { o[r[key]] = r.c; }); return o; }
  // Beliebteste Reisezeiträume aus den Buchungsanfragen (Anreise-Monat)
  var travelMonths = await rows("SELECT to_char(date_trunc('month', checkin),'YYYY-MM') AS m, COUNT(*)::int c FROM bookings WHERE checkin IS NOT NULL GROUP BY 1 ORDER BY 1");
  res.json({
    total, last7, last30, byTab, byLang, byRef, byDay, waitlist, bookings,
    byDevice, byDow, byHour,
    langRecent: toMap(byLang7, 'lang'), refRecent: toMap(byRef7, 'ref'),
    travelMonths
  });
});

// ── PREISE ──
// Standardpreise (Fallback, falls in den Einstellungen noch nichts gespeichert ist)
const DEFAULT_PRICES = {
  low:  { nightly: 240, weekly: 1550, minNights: 4 },
  mid:  { nightly: 390, weekly: 2600, minNights: 5 },
  high: { nightly: 690, weekly: 4500, minNights: 7 },
  cleaning: 150, cleaningIncluded: false
};
function sanitizeSeason(s, def) {
  s = s || {};
  var n = function (v, d) { v = Math.round(Number(v)); return (isFinite(v) && v >= 0 && v <= 100000) ? v : d; };
  return { nightly: n(s.nightly, def.nightly), weekly: n(s.weekly, def.weekly), minNights: Math.min(30, Math.max(1, n(s.minNights, def.minNights))) };
}
function sanitizePrices(p) {
  p = p || {};
  return {
    low: sanitizeSeason(p.low, DEFAULT_PRICES.low),
    mid: sanitizeSeason(p.mid, DEFAULT_PRICES.mid),
    high: sanitizeSeason(p.high, DEFAULT_PRICES.high),
    cleaning: Math.min(100000, Math.max(0, Math.round(Number(p.cleaning)) || 0)),
    cleaningIncluded: !!p.cleaningIncluded
  };
}
async function getPrices() {
  try {
    var r = await pool.query("SELECT value FROM settings WHERE key='prices'");
    if (r.rows.length) return sanitizePrices(JSON.parse(r.rows[0].value));
  } catch (e) { /* Fallback unten */ }
  return DEFAULT_PRICES;
}

// Öffentlich: aktuelle Preise (für die Website)
app.get('/api/prices', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(await getPrices());
});

// Admin: Preise speichern
app.post('/api/admin/prices', authMiddleware, async (req, res) => {
  try {
    var clean = sanitizePrices(req.body);
    await pool.query(
      "INSERT INTO settings (key, value, updated_at) VALUES ('prices', $1, NOW()) ON CONFLICT (key) DO UPDATE SET value=$1, updated_at=NOW()",
      [JSON.stringify(clean)]
    );
    res.json({ ok: true, prices: clean });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// ── BLOCKED DATES ──
app.get('/api/blocked-dates', async (req, res) => {
  const result = await pool.query('SELECT * FROM blocked_dates ORDER BY date_from');
  res.json(result.rows);
});
 
app.post('/api/admin/blocked-dates', authMiddleware, async (req, res) => {
  const { date_from, date_to, label } = req.body;
  await pool.query('INSERT INTO blocked_dates (date_from, date_to, label) VALUES ($1,$2,$3)', [date_from, date_to, label]);
  res.json({ success: true });
});
 
app.delete('/api/admin/blocked-dates/:id', authMiddleware, async (req, res) => {
  await pool.query('DELETE FROM blocked_dates WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});
 
// ── SERVE PAGES ──
app.get('/admin', (req, res) => { res.set('X-Robots-Tag', 'noindex, nofollow, noarchive'); res.sendFile(path.join(__dirname, 'admin.html')); });
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
 
// Start
setupDB().then(() => {
  app.listen(PORT, () => console.log(`🏠 Villa Las Hermanas läuft auf Port ${PORT}`));
});
