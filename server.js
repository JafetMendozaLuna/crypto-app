const express = require("express");
const forge = require("node-forge");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.options('*', cors()); 

/* =========================
   GENERAR CLAVES RSA
========================= */
app.get("/generate-keys", (req, res) => {
    const keypair = forge.pki.rsa.generateKeyPair(2048);

    res.json({
        publicKey: forge.pki.publicKeyToPem(keypair.publicKey),
        privateKey: forge.pki.privateKeyToPem(keypair.privateKey)
    });
});

/* =========================
   CIFRAR MENSAJE
========================= */
app.post("/encrypt", (req, res) => {
    const { message, publicKey } = req.body;

    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
    let encrypted = cipher.update(message, "utf8", "base64");
    encrypted += cipher.final("base64");

    const pubKey = forge.pki.publicKeyFromPem(publicKey);
    const encryptedKey = pubKey.encrypt(aesKey.toString("binary"));

    res.json({
        encryptedMessage: encrypted,
        encryptedKey: forge.util.encode64(encryptedKey),
        iv: iv.toString("base64")
    });
});

/* =========================
   DESCIFRAR MENSAJE
========================= */
app.post("/decrypt", (req, res) => {
    const { encryptedMessage, encryptedKey, privateKey, iv } = req.body;

    const privKey = forge.pki.privateKeyFromPem(privateKey);
    const aesKeyBinary = privKey.decrypt(forge.util.decode64(encryptedKey));
    const aesKey = Buffer.from(aesKeyBinary, "binary");

    const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        aesKey,
        Buffer.from(iv, "base64")
    );

    let decrypted = decipher.update(encryptedMessage, "base64", "utf8");
    decrypted += decipher.final("utf8");

    res.json({ message: decrypted });
});

/* =========================
   PUERTO PARA HOSTING
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor en puerto " + PORT));