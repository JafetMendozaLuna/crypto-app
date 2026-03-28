let encryptedData = {};

const API_URL = "https://TU-APP.onrender.com"; // ← CAMBIAR DESPUÉS

async function generateKeys() {
    const res = await fetch(API_URL + "/generate-keys");
    const data = await res.json();

    document.getElementById("keys").innerText =
        "PUBLIC KEY:\n" + data.publicKey +
        "\nPRIVATE KEY:\n" + data.privateKey;

    document.getElementById("publicKey").value = data.publicKey;
    document.getElementById("privateKey").value = data.privateKey;
}

async function encrypt() {
    const message = document.getElementById("message").value;
    const publicKey = document.getElementById("publicKey").value;

    const res = await fetch(API_URL + "/encrypt", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ message, publicKey })
    });

    encryptedData = await res.json();

    document.getElementById("encrypted").innerText =
        JSON.stringify(encryptedData, null, 2);
}

async function decrypt() {
    const privateKey = document.getElementById("privateKey").value;

    const res = await fetch(API_URL + "/decrypt", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            ...encryptedData,
            privateKey
        })
    });

    const data = await res.json();

    document.getElementById("decrypted").innerText = data.message;
}