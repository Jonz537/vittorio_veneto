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

app.post("/enable-user", async (req, res) => {
    const { uid } = req.body;

    if (!uid) return res.status(400).send("Missing UID");

    try {
        await admin.auth().updateUser(uid, { disabled: false });
        res.status(200).send(`User ${uid} has been enabled.`);
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

app.post("/set-role", async (req, res) => {
    const { uid, role } = req.body;

    if (!uid || !role) return res.status(400).send("Missing uid or role");

    try {
        await admin.auth().setCustomUserClaims(uid, { role });
        res.status(200).send(`Role '${role}' has been assigned to user ${uid}`);
    } catch (err) {
        res.status(500).send("Error setting role: " + err.message);
    }
});

app.get("/get-user-status", async (req, res) => {
    const {uid} = req.query;

    if (!uid) return res.status(400).send("Missing UID");

    try {
        const userRecord = await admin.auth().getUser(uid);

        const customClaims = userRecord.customClaims || {};
        const role = customClaims.role || "none";
        const isDisabled = userRecord.disabled === true;

        res.status(200).json({
            uid: userRecord.uid,
            email: userRecord.email || null,
            role: role,
            disabled: isDisabled
        });

    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.get("/get-users-status", async (req, res) => {
    try {
        const raw = req.query.uids;
        const uids = JSON.parse(decodeURIComponent(raw));

        const results = {};

        for (const uid of uids) {
            try {
                const user = await admin.auth().getUser(uid);
                results[uid] = {
                    role: user.customClaims?.role || "none",
                    disabled: user.disabled || false
                };
            } catch (err) {
                results[uid] = { error: err.message };
            }
        }

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
