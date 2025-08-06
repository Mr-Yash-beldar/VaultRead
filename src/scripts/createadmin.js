import { connectDB } from "../config/db.js";
import { createAdmin } from "../routes/auth.routes.js";

connectDB();
await createAdmin();
console.log("Admin creation script executed successfully.");
process.exit(0);
