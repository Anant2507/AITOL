import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRouter from "./auth";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use( authRouter);

app.use(cors());
app.use(express.json());

// Placeholder stats endpoint — we'll connect real Redis data later
app.get("/stats", (req, res) => {
  res.json({
    cacheHitRate: 95,
    costSaved: 142.3,
    requestsProcessed: 12480,
    avgResponseTimeMs: 320,
    requestsLast7Days: [
      { day: "Mon", requests: 1200 },
      { day: "Tue", requests: 1900 },
      { day: "Wed", requests: 1500 },
      { day: "Thu", requests: 2400 },
      { day: "Fri", requests: 2100 },
      { day: "Sat", requests: 1700 },
      { day: "Sun", requests: 2480 },
    ],
  });
});

app.get("/", (req, res) => {
  res.send("AITOL backend is running");
});

app.listen(PORT, () => {
  console.log(`AITOL backend running on http://localhost:${PORT}`);
});