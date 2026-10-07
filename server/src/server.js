import "dotenv/config";
import app from "./app.js";
import connectDatabase from "./configs/database.js";

const PORT = process.env.PORT || 5000;

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB failed to connect with server", error.message);
    process.exit(1);
  });