require("dotenv").config();
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const pool = require("../db");

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWD
  }
});

router.post("/", async (req, res) => {
  console.log("hit")
  try {
    const result = await pool.query("SELECT * FROM caja WHERE id=$1", [req.body.id]);
    const box = result.rows[0];
    await transport.sendMail({
      from: process.env.MAIL_USER,
      to: "gustavo.tecchio@iescapdellevant.org",
      subject: "Stock bajo",
      text: `[Este mensaje fue enviado automáticamente con la herramienta de inventario]\n\n¡Alerta! Restan solamente ${box.quantity} ${box.name}.\nConsidera usarlos con menos frecuencia y comprar más ${box.name}`
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
