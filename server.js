const express = require("express");
const sharp = require("sharp");
const axios = require("axios");

const app = express();

const PORT = process.env.PORT || 3000;

const BASE_IMAGE_URL = "https://backend.wplace.live";

app.get("/files/*", async (req, res) => {
  const originalPath = req.params[0];
  const blending = req.query.blending || "over";
  const darken = req.query.darken === "true";

  try {
    const [baseImageRes, overlayRes] = await Promise.all([
      axios.get(`${BASE_IMAGE_URL}/files/${originalPath}`, { responseType: "arraybuffer" }),
      axios.get(`https://seu-servidor.com/sua-imagem.png`, { responseType: "arraybuffer" }) // Substituir depois
    ]);

    const baseImage = sharp(baseImageRes.data).resize(3000, 3000, { fit: "fill" });
    const overlay = sharp(overlayRes.data).resize(3000, 3000, { fit: "fill" });

    const composite = await baseImage
      .composite([
        {
          input: await overlay.toBuffer(),
          blend: blending,
        },
      ])
      .png()
      .toBuffer();

    res.set("Content-Type", "image/png");
    res.send(composite);
  } catch (e) {
    console.error(e);
    res.status(500).send("Erro ao processar imagem.");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
