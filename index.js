require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const app = express();
const urlDatabase = {};

const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl", async (req, res) => {
  const longUrl = req.body.url;
  if (!longUrl) {
    return res.status(400).send("URL is required");
  }

  // Perform DNS lookup to validate the URL
  dns.lookup(longUrl, (err, address, family) => {
    if (err) {
      console.error("Error validating URL:", err);
      return res.status(400).send("Invalid URL");
    }

    // If DNS lookup succeeds, generate short URL
    generateShortUrl(longUrl, res);
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

app.get("/api/shorturl/:id", (req, res) => {
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
