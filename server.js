const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
const os = require("os");

const app = express();
const port = 3001;

app.use(cors());

// 🧠 Lanzamos Puppeteer una vez sola
let browser;

(async () => {
  try {
    const isWindows = os.platform() === "win32";

    browser = await puppeteer.launch({
      headless: true,
      executablePath: isWindows ? undefined : process.env.CHROME_PATH || "/usr/bin/chromium",
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      protocolTimeout: 60000,
    });

    console.log("✅ Navegador Puppeteer lanzado");
  } catch (err) {
    console.error("❌ Error al lanzar Puppeteer:", err);
  }
})();

app.get("/proxy", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "URL requerida" });
  }

  let page;
  try {
    page = await browser.newPage();

    // 🔒 Desactivar carga de imágenes y otros recursos innecesarios
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const resourceType = req.resourceType();
      if (["image", "stylesheet", "font"].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // 🕵️ User-Agent más confiable
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36"
    );

    // ⏱️ Carga más rápida sin esperar todo
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    const values = await page.evaluate(() => ({
      CAE: document.querySelector("#p_CAE")?.value || null,
      Fecha_emision: document.querySelector("#p_fch_emision")?.value || null,
      tipo_cbte: document.querySelector("#ctl00_cphBody_p_tipo_cbte")?.value || null,
      Punto_vta: document.querySelector("#p_pto_vta")?.value || null,
      Nro_cbte: document.querySelector("#p_nro_cbte")?.value || null,
      p_importe: document.querySelector("#p_importe")?.value || null,
      tipo_doc: document.querySelector("#ctl00_cphBody_p_tipo_doc")?.value || null,
      nro_doc: document.querySelector("#p_nro_doc")?.value || null,
      CUIT: document.querySelector("#p_CUIT")?.value || null,
    }));

    console.log("✅ Valores extraídos:", values);
    res.json(values);
  } catch (error) {
    console.error("❌ Error al procesar la página:", error);
    res.status(500).json({ error: "Error al obtener los datos", details: error.message });
  } finally {
    if (page) await page.close();
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
