import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet"; 
import authRoutes from "./routes/auth.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";




const app = express();


app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

if(process.env.NODE_ENV !== "production"){
    app.use(morgan("dev"));
} 

app.get("/api/v1/health", (req, res) => {
    res.json({
        success: true,
        message: "Event Booking API is running",
    });
});

app.use("/api/v1/auth", authRoutes);


// Error handle 
app.use(errorMiddleware);

export default app;