import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/Mongodb.js";
import adminRouter from "./routes/adminRoutes.js";
import blogRouter from "./routes/blogRoutes.js";

/********************************* App Config *********************************/
const app = express();
const port = process.env.PORT || 4000;
connectDB();

/********************************* Middlewares *********************************/
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS for all routes

/******************************** API Endpoints ********************************/
app.get("/", (req, res) => {
  res.send("API is Working");
});

app.use("/api/admin", adminRouter);
app.use("/api/blog", blogRouter);

/******************************** Error Handling *******************************/
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack
  res.status(500).send("Something broke!"); // Send a generic error response
});

/******************************** Start Server ********************************/
app.listen(port, () => {
  console.info(`Server started on PORT: ${port}`);
});
