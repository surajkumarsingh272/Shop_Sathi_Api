require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5000;

console.log("ACCOUNT_SID =", process.env.TWILIO_ACCOUNT_SID);
console.log("AUTH_TOKEN =", process.env.TWILIO_AUTH_TOKEN);
console.log("VERIFY_SID =", process.env.TWILIO_VERIFY_SID);
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
