require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const urlParser = require('url');

app.use(express.urlencoded({extended:true}))

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// app.post('/api/shorturl', (req, res) => {
//   const url = req.body.url;
//   const hostname = urlParser.parse(url).hostname;

//   dns.lookup(hostname, (err) => {
//     if (err) return res.json({ error: 'invalid url' });

//     // Proceed to store and respond
//   });
// });

let urlDatabase = {};
let counter = 1;

// app.post('/api/shorturl', (req, res) => {
//   const original_url = req.body.url;

//   // Validate and store
//   urlDatabase[counter] = original_url;
//   res.json({ original_url, short_url: counter });
//   counter++;
// });


app.post('/api/shorturl', (req, res) => {
  const original_url = req.body.url;

  try {
    const parsedUrl = new URL(original_url);

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }

    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      urlDatabase[counter] = original_url;

      res.json({
        original_url,
        short_url: counter
      });

      counter++;
    });
  } catch {
    return res.json({ error: 'invalid url' });
  }
});


app.get('/api/shorturl/:short_url', (req, res) => {
  const short = req.params.short_url;
  const original = urlDatabase[short];

  if (original) return res.redirect(original);
  res.status(404).json({ error: 'No short URL found' });
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
