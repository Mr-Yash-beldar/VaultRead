import app from "./src/app.js";
import secret from "./src/config/config.js";
const PORT = secret.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
