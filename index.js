require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const app = express();

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
  const parsedUrl = urlparser.parse(url);

  // Check if the URL is valid
  dns.lookup(parsedUrl.hostname, async (err, address) => {
    if (!address) {
      res.json({ error: "Invalid URL" });
    } else {
      // Generate short URL based on the array length
      const shortUrl = urlDatabase.length;

      // Add URL to the database
      urlDatabase.push({ url: url, short_url: shortUrl });

      // Send response with original and short URL
      res.json({ original_url: url, short_url: shortUrl });
    }
  });
});

async function generateShortUrl(longUrl, res) {
  try {
    // Dynamically import nanoid
    const { nanoid } = await import("nanoid");
    const shortId = nanoid(7); // Generate a unique ID with a length of 7
    urlDatabase[shortId] = longUrl;

    res.json({ original_url: longUrl, short_url: shortId });
  } catch (error) {
    console.error("Error generating short URL:", error);
    res.status(500).send("Error generating short URL");
  }
}

app.get("/api/shorturl/:short_url", (req, res) => {
  const shortId = req.params.id;
  const longUrl = urlDatabase[shortId];

  if (longUrl) {
    res.redirect(longUrl);
  } else {
    res.status(404).send("URL not found");
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
