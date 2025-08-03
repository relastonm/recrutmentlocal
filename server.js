const express = require('express');
const multer   = require('multer');
const fs       = require('fs');
const path     = require('path');

const app  = express();
const PORT = 3000;

// 1. Only serve the public folder
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Safer upload config
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_, file, cb) =>
    /image\/(jpe?g|png)/.test(file.mimetype) ? cb(null, true) : cb(new Error('Only images allowed'))
});

// 3. Single endpoint
app.post('/verify', upload.single('selfieData'), async (req, res) => {
  console.log('\n=== Data received ===');
  console.log('Body :', req.body);
  if (req.file) console.log('File :', req.file.filename, req.file.size, 'bytes');

  // 4. Async logging
  try {
    await fs.promises.appendFile(
      'log.txt',
      JSON.stringify({ ...req.body, file: req.file?.filename, ts: Date.now() }) + '\n'
    );
  } catch (e) {
    console.error('Log write failed', e);
  }
  res.json({ ok: true });
});

// 5. Central error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(400).json({ ok: false, message: err.message });
});

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));