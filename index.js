import express from "express";
import { chromium } from "playwright";

const app = express();
app.use(express.json());

app.post("/fetch", async (req, res) => {
  const { url } = req.body;
  if (!url || !url.includes("instagram.com")) {
    return res.status(400).json({ error: "Invalid Instagram URL" });
  }

  try {
    const browser = await chromium.launch({ args: ["--no-sandbox"], headless: true });
    const page = await browser.newPage();

    await page.goto("https://fastdl.app/en", { waitUntil: "domcontentloaded" });
    await page.fill("input[name='url']", url);
    await page.click("button.search-form__button");

    await page.waitForSelector("a.button__download", { timeout: 20000 });

    const links = await page.$$eval("a.button__download", els =>
      els.map(el => el.href)
    );

    await browser.close();
    res.json({ links });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Failed to fetch download links" });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Insta Downloader Server is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
