import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import {Server} from "socket.io";
import http from "http";

// import cron from "node-cron";
import KaryawanRoute from "./routes/KaryawanRoute.js"
import UserRoute from "./routes/UserRoutes.js";
import CategoryRoute from "./routes/CategoryRoute.js";
import DocumentRoute from "./routes/DocumentRoute.js";
import LogSignRoute from "./routes/LogSignRoute.js";
import SignerRoute from "./routes/SignerRoute.js";
import ItemRoute from "./routes/ItemRoute.js";
import verifyToken from "./middlewares/authMiddleware.js";
import dotenv from 'dotenv';
import "./cronjobs.js";

import ReceiveDocumentRoute from "./routes/ReceiveDocumentRoute.js";

import './models/KaryawanModel.js';
import './models/Association.js';
import './models/UserModel.js';
import './models/KategoriDokModel.js';
import './models/DokumenModel.js';
import './models/LogSignModel.js';
import './models/ItemModel.js';
import './models/SignersModel.js';
import jwt from 'jsonwebtoken';



// import io from "socket.io-client";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"], 
        credentials: true,
    }
});

io.on("connection", (socket) => {
    console.log("Client connected: ", socket.id);

    socket.on("disconnect", () => {
        console.log("Client disconnected: ", socket.id);
    });
}); 

app.set("io", io);
// app.set('trust proxy', true);
app.use(bodyParser.json());
app.use(cors({origin: "http://localhost:3000", credentials: true}));
app.use(express.json());

app.use(UserRoute); // Rute user untuk login, tanpa middleware otentikasi
app.use(ReceiveDocumentRoute);

const protectedRoutes = [
    KaryawanRoute,
    CategoryRoute,
    DocumentRoute, 
    LogSignRoute, 
    ItemRoute, 
    SignerRoute
];

// Terapkan middleware otentikasi pada routes yang dilindungi
protectedRoutes.forEach(route => {
    app.use(verifyToken, route); 
});

// app.listen(5000, () => console.log('Server up and running on port 5000'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

