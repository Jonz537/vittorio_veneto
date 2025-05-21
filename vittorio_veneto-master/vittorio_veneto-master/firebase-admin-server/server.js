const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

app.post("/disable-user", async (req, res) => {
    const { uid } = req.body;

    if (!uid) return res.status(400).send("Missing UID");

    try {
        await admin.auth().updateUser(uid, { disabled: true });
        res.status(200).send(`User ${uid} has been disabled.`);
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
