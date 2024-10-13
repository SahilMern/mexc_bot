console.log("JAI SHREE RAM JI / JAI BAJARANG BALI JI");
require("dotenv").config({path:"../.env"});
const axios = require("axios");
const crypto = require("crypto");
const cancel_all_orders = require("./cancelAll");

//? Credentials
const API_KEY = process.env.API_KEY_1;
const API_SECRET = process.env.API_SECRET_1;
const BASE_URL = process.env.BASE_URL;

//? Get current timestamp
function get_timestamp() {
  return new Date().getTime().toString();
}

//? Generate signature based on query string
function generate_signature(queryString) {
  return crypto.createHmac("sha256", API_SECRET).update(queryString).digest("hex");
}

//? Function to cancel an active order
async function cancel_Sell_order(symbol, orderId = null, origClientOrderId = null) {
  const path = "/api/v3/order";
  const timestamp = get_timestamp();

  // Construct the query string
  let queryString = `symbol=${symbol}&timestamp=${timestamp}`;
  if (orderId) {
    queryString += `&orderId=${orderId}`;
  } else if (origClientOrderId) {
    queryString += `&origClientOrderId=${origClientOrderId}`;
  }

  const signature = generate_signature(queryString);

  // Final URL with the query string and signature
  const url = `${BASE_URL}${path}?${queryString}&signature=${signature}`;

  // Headers with the API Key
  const headers = {
    "X-MEXC-APIKEY": API_KEY,
  };

  try {
    // Send a DELETE request to cancel the order
    const response = await axios.delete(url, { headers });
    // console.log("Order canceled successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error canceling order:", error.response ? error.response.data : error.message);
    await cancel_all_orders("DEODUSDT");
  }
}


module.exports = cancel_Sell_order;

