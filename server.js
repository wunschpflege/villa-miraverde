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
 
// ── KEIN CACHING für HTML-Dateien ──
app.use((req, res, next) => {
  if (req.path.endsWith('.html') || req.path === '/' || req.path === '/admin') {
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
    `);
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

// ── AUTH ROUTES ──
// ── LOGIN mit einfachem Rate-Limiting (Brute-Force-Schutz, ohne Zusatzpaket) ──
const loginAttempts = new Map(); // ip -> { count, first }
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000; // 15 Minuten

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
  if (password === ADMIN_PASSWORD) {
    loginAttempts.delete(ip);
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token });
  } else {
    const rec = loginAttempts.get(ip) || { count: 0, first: now };
    rec.count += 1;
    loginAttempts.set(ip, rec);
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
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
 
// Start
setupDB().then(() => {
  app.listen(PORT, () => console.log(`🏠 Villa Las Hermanas läuft auf Port ${PORT}`));
});
