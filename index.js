import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.get("/", async (req, res) => {
    const authHeader = req.headers.authorization;
    const expected = `Bearer ${process.env.AUTH_TOKEN}`;

    if (!authHeader || authHeader !== expected) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const headers = {
        "Accept": "application/json",
        "Accept-Language": "en",
        "Content-Type": "application/json",
        "Connection": "keep-alive",
        "User-Agent": process.env.TF_SESSION_ID,
        "X-Session-Id": process.env.TF_SESSION_ID,
        "X-Session-Digest": process.env.TF_SESSION_DIGEST,
        "X-Apple-Store-Front": process.env.TF_APPLE_STORE_FRONT,
        "X-Apple-TA-Device": process.env.APPLE_DEVICE_MODAL,
        "X-Apple-Device-Model": process.env.APPLE_DEVICE_MODAL,
        "X-Request-Id": process.env.TF_REQUEST_ID,
        "X-Apple-AMD-M": process.env.TF_AMD_M,
    };

    try {
        const response = await fetch(`https://testflight.apple.com/v3/accounts/${process.env.TF_ACCOUNT_ID}/apps`, {
            method: "GET",
            headers,
        });

        if (!response.ok) {
            return res.status(response.status).json({
                error: "TestFlight API error",
                status: response.status,
                statusText: response.statusText,
            });
        }

        const data = await response.json();

        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");
        res.send(JSON.stringify(data, null, 2));
    } catch (err) {
        res.status(502).json({
            error: "Failed to reach TestFlight API",
            details: err.message,
        });
    }
});

app.listen(process.env.PORT ?? "3000", () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});