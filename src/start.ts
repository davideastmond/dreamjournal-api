require("dotenv").config();

import connectDB from "./database.config";
import server from "./server";

const port = process.env.PORT || 5000;

connectDB();

server.listen(port, () => {
  console.log(`HTTP server listening on port ${port}`);
});
