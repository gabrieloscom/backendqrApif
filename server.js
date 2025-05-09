const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer"); // Importa Puppeteer

const app = express();
const port = 3001;

app.use(cors());

// Ruta del proxy
app.get("/proxy", async (req, res) => {
  let url = req.query.url; // Obtener la URL desde la query params

  if (!url) {
    return res.status(400).json({ error: "URL requerida" }); // Validación de URL
  }

  try {
    // Inicia Puppeteer con el path del ejecutable de Chrome
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.CHROME_PATH || '/usr/bin/chromium-browser', // Ajusta la ruta si es necesario
    });
    const page = await browser.newPage();

    // Navega a la URL proporcionada
    await page.goto(url, { waitUntil: "networkidle2" }); // Espera a que cargue completamente

    // Extrae los valores de los inputs por id
    const values = await page.evaluate(() => {
      return {
        CAE: document.querySelector("#p_CAE") ? document.querySelector("#p_CAE").value : null,
        Fecha_emision: document.querySelector("#p_fch_emision") ? document.querySelector("#p_fch_emision").value : null,
        tipo_cbte: document.querySelector("#ctl00_cphBody_p_tipo_cbte") ? document.querySelector("#ctl00_cphBody_p_tipo_cbte").value : null,
        Punto_vta: document.querySelector("#p_pto_vta") ? document.querySelector("#p_pto_vta").value : null,
        Nro_cbte: document.querySelector("#p_nro_cbte") ? document.querySelector("#p_nro_cbte").value : null,
        p_importe: document.querySelector("#p_importe") ? document.querySelector("#p_importe").value : null,
        tipo_doc: document.querySelector("#ctl00_cphBody_p_tipo_doc") ? document.querySelector("#ctl00_cphBody_p_tipo_doc").value : null,
        nro_doc: document.querySelector("#p_nro_doc") ? document.querySelector("#p_nro_doc").value : null,
      };
    });

    console.log("Valores extraídos:", values); // Muestra los valores extraídos

    // Cierra el navegador
    await browser.close();

    // Devuelve los valores extraídos al cliente
    res.json(values);

  } catch (error) {
    console.error("Error al obtener los datos:", error);
    res.status(500).json({ error: "Error al obtener los datos", details: error.message });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor proxy corriendo en http://localhost:${port}`);
});
