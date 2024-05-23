require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const urlparser = require("url");

const app = express();

// Initialize an array to store URLs
let urlDatabase = [];

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.post("/api/shorturl", function (req, res) {
  console.log(req.body);
  const url = req.body.url;

  // Check if the URL starts with a protocol, if not, prepend 'http://'
  const fullUrl = /^(?:f|ht)tps?\:\/\//.test(url) ? url : "http://" + url;

  const parsedUrl = urlparser.parse(fullUrl);

  // Check if the URL is valid
  dns.lookup(parsedUrl.hostname, (err, address) => {
    if (!address) {
      res.json({ error: "Invalid URL" });
    } else {
      // Generate short URL based on the array length
      const shortUrl = urlDatabase.length;

      // Add URL to the database
      urlDatabase.push({ url: fullUrl, short_url: shortUrl });

      // Send response with original and short URL
      res.json({ original_url: fullUrl, short_url: shortUrl });
    }
  });
});

app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = req.params.short_url;
  const urlEntry = urlDatabase.find((entry) => entry.short_url === +shortUrl);

  if (urlEntry) {
    res.redirect(urlEntry.url);
  } else {
    res.status(404).send("URL not found");
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
