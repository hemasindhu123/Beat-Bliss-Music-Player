const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// 👇 Point to uploads/songs
const uploadsDir = path.join(__dirname, '..', 'uploads', 'songs');

router.get('/', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to scan songs folder' });
    }

    const songs = files
      .filter(file => file.endsWith('.mp3'))
      .map(file => ({
        title: file.replace('.mp3', ''),
        file: file
      }));

    res.json(songs);
  });
});

module.exports = router;
