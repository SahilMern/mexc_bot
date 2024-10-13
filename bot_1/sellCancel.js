console.log("JAI SHREE RAM JI / JAI BAJARANG BALI JI ");
require("dotenv").config({path:"../.env"});
const axios = require("axios");
const crypto = require("crypto");
const cancel_Sell_order = require("./cancelSingleOrder");
const cancel_all_orders = require("./cancelAll");

//? Credentials
const API_KEY = process.env.API_KEY_1;
const API_SECRET = process.env.API_SECRET_1;
const BASE_URL = process.env.BASE_URL_1;

//? Random Number Generator
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//? Random Price Generator
function randomPrice(min, max) {
  return Math.random() * (max - min) + min;
}

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

//? MAIN BUY AND SELL CODE
async function place_order(symbol, side, type, quantity, price) {
  console.log(side, symbol, quantity, price, "Current Order Details");
  const path = "/api/v3/order";
  const timestamp = get_timestamp();

  // Create query string
  const queryString = `symbol=${symbol}&side=${side}&type=${type}&quantity=${quantity}&price=${price}&timestamp=${timestamp}`;
  const signature = generate_signature(queryString);

  const url = `${BASE_URL}${path}?${queryString}&signature=${signature}`;

  const headers = {
    "X-MEXC-APIKEY": API_KEY,
  };

  try {
    const response = await axios.post(url, {}, { headers });
    // console.log("Order Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error in place Order:",
      error.response ? error.response.data : error.message
    );
    return null;
  }
}

const sellCancel = async () => {
  while (true) {
    try {
      const getPrice = await axios.get(
        "https://api.mexc.com/api/v3/ticker/24hr?symbol=DEODUSDT"
      );
      const SellPrice = parseFloat(getPrice.data.askPrice);
      const sellPriceUpdate = SellPrice + 0.00003;
      console.log(sellPriceUpdate, "sellPriceUpdate");
      const randomUsdtPrice = await randomNumber(6, 6);
      const sizeforBuy = Math.floor(randomUsdtPrice / sellPriceUpdate);
      // console.log(sizeforBuy, "sizeforBuy");
      // console.log(finalPrice, "randomUsdtPrice");
      // console.log(randomUsdtPrice, "randomUsdtPrice");
      // console.log(sizeforBuy, "sizeforBuy");
      // Place Sell order
      const selldetails = await place_order(
        "DEODUSDT",
        "SELL",
        "LIMIT",
        sizeforBuy,
        sellPriceUpdate
      );
      console.log(selldetails.orderId, "selldetails");
      const orderId = selldetails.orderId;
      console.log(orderId);
      await cancel_Sell_order("DEODUSDT",orderId );
      console.log("Sell Cancel Done");
    } catch (error) {
      console.error("Error:", error);
      await cancel_all_orders("DEODUSDT");
    }

    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
};

sellCancel();
