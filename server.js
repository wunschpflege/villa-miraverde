const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'villa-las-hermanas-secret-2025';

// Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(express.json());
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

// ── AUTH ROUTES ──
app.post('/api/login', async (req, res) => {
  const { password } = req.body;
  const adminPass = process.env.ADMIN_PASSWORD || 'hermanas2025';
  if (password === adminPass) {
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } else {
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
