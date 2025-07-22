const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth'); // your auth routes
const songsRoutes = require('./routes/songs'); // 👈 Import songs routes
const path = require('path');
const cheerio = require('cheerio'); 

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/uploads/songs', express.static('uploads/songs'));
app.get('/lyrics/:title', async (req, res) => {
  const { title } = req.params;
  const query = encodeURIComponent(title);

  try {
    // Step 1: Search Genius for the song
    const searchUrl = `https://api.genius.com/search?q=${query}`;
    const searchResponse = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`
      }
    });
    const searchData = await searchResponse.json();

    const songPath = searchData.response?.hits?.[0]?.result?.path;
    if (!songPath) {
      return res.status(404).json({ error: 'Lyrics not found' });
    }

    // Step 2: Scrape the song page
    const pageUrl = `https://genius.com${songPath}`;
    const pageResponse = await fetch(pageUrl);
    const html = await pageResponse.text();
    const $ = cheerio.load(html);

   let lyrics = '';

$('div[data-lyrics-container="true"]').each((i, el) => {
  const lines = $(el).contents().map((i, elem) => {
    if (elem.type === 'text') return $(elem).text();
    if (elem.name === 'br') return '\n';
    return $(elem).text();
  }).get().join('');

  if (lines.trim()) {
    lyrics += lines.trim() + '\n\n'; 
  }
});

lyrics = lyrics.trim();

    console.log('Lyrics fetched:', lyrics);

    if (!lyrics) {
      return res.status(404).json({ error: 'Lyrics not found in the page.' });
    }

    res.json({ lyrics });
  } catch (err) {
    console.error('Lyrics fetch error:', err);
    res.status(500).json({ error: 'Server error while fetching lyrics' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/songs', songsRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
