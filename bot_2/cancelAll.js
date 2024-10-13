console.log("JAI SHREE RAM JI / JAI BAJARANG BALI JI ");
require("dotenv").config({path:"../.env"});
const axios = require("axios");
const crypto = require("crypto");

//? Credentials
const API_KEY = process.env.API_KEY_2;
const API_SECRET = process.env.API_SECRET_2;
const BASE_URL = process.env.BASE_URL;

//? Get current timestamp
function get_timestamp() {
  return new Date().getTime().toString();
}

//? Generate signature based on query string
function generate_signature(queryString) {
  return crypto
    .createHmac("sha256", API_SECRET)
    .update(queryString)
    .digest("hex");
}

//? Function to cancel all open orders for a symbol
async function cancel_all_orders(symbol) {
  const path = "/api/v3/openOrders";
  const timestamp = get_timestamp();

  const queryString = `symbol=${symbol}&timestamp=${timestamp}`;
  const signature = generate_signature(queryString);

  const url = `${BASE_URL}${path}?${queryString}&signature=${signature}`;

  const headers = {
    "X-MEXC-APIKEY": API_KEY,
  };

  try {
    const response = await axios.delete(url, { headers });
    // console.log("All orders canceled successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error canceling orders:",
      error.response ? error.response.data : error.message
    );
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}


module.exports = cancel_all_orders;
