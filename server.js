// server.js
const express = require('express');
const multer  = require('multer');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const upload = multer();          // in-memory, no disk files except our txt log

// serve the static HTML
app.use(express.static('.'));

// handle POST /submit
app.post('/submit', upload.any(), (req, res) => {
    const now = new Date().toISOString();
    let text  = `\n--- ${now} ---\n`;

    // normal fields
    Object.keys(req.body).forEach(k => {
        text += `${k}: ${req.body[k]}\n`;
    });

    // uploaded files
    (req.files || []).forEach(f => {
        text += `file:${f.originalname} (${f.size} bytes)\n`;
    });

    fs.appendFileSync('submissions.txt', text);
    res.sendStatus(200);          // just OK back to the browser
});

app.listen(3000, () => {
    console.log('Server on http://localhost:3000  (logs → submissions.txt)');
});
