require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const app = express();
const urlparser = require("url");

const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

let urlDatabase = [];

app.post("/api/shorturl", function (req, res) {
  console.log(req.body);
  const url = req.body.url;

  // Check if the URL starts with a protocol, if not, prepend 'http://'
  const fullUrl = /^(?:f|ht)tps?\:\/\//.test(url) ? url : "http://" + url;

  const parsedUrl = urlparser.parse(fullUrl);

  // Check if the URL is valid
  dns.lookup(parsedUrl.hostname, async (err, address) => {
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
  const shortId = parseInt(req.params.short_url); // Parse the short_url parameter as an integer
  const urlEntry = urlDatabase.find((entry) => entry.short_url === shortId); // Find the entry in the database

  if (urlEntry) {
    res.redirect(urlEntry.url); // Redirect to the long URL
  } else {
    res.status(404).send("URL not found");
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
