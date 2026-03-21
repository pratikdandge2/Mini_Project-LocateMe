import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import admin from "firebase-admin";
import dotenv from "dotenv";
import { initSocket } from "./socket/commentSocket.js";
import itemRoutes from "./routes/items.js";

dotenv.config();

const normalizeOrigin = (origin) => origin?.trim().replace(/\/+$/, "");
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

const corsOriginHandler = (origin, callback) => {
  if (!origin) return callback(null, true);
  const normalizedOrigin = normalizeOrigin(origin);
  if (allowedOrigins.includes(normalizedOrigin)) {
    return callback(null, true);
  }
  return callback(new Error("Not allowed by CORS"));
};

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const app = express();
const httpServer = http.createServer(app);

export const io = new Server(httpServer, {
  cors: { origin: corsOriginHandler, methods: ["GET", "POST"] },
});

app.use(cors({ origin: corsOriginHandler }));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"));

app.use("/api/items", itemRoutes);

initSocket(io);

httpServer.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);
