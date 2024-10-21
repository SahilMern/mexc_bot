console.log("JAI SHREE RAM JI / JAI BAJARANG BALI JI ");
require("dotenv").config({ path: "../.env" });
const axios = require("axios");
const crypto = require("crypto");
const cancel_all_orders = require("./cancelAll");

//? Credentials
const API_KEY = process.env.API_KEY_2;
const API_SECRET = process.env.API_SECRET_2;
const BASE_URL = process.env.BASE_URL;

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

const main = async () => {
  while (true) {
    try {
      const getPrice = await axios.get(
        "https://api.mexc.com/api/v3/ticker/24hr?symbol=DEODUSDT"
      );
      const buyPrice = parseFloat(getPrice.data.bidPrice);
      const SellPrice = parseFloat(getPrice.data.askPrice);
      const difference = parseFloat((SellPrice - buyPrice).toFixed(6));
      if (difference > 0.000001) {
        const buyPriceUpdate = buyPrice + 0.000001;
        const sellPriceUpdate = SellPrice - 0.000001;

        const randomDeodPrice = randomPrice(
          buyPriceUpdate,
          sellPriceUpdate
        ).toFixed(6);

        const finalPrice = parseFloat(randomDeodPrice);
        const randomUsdtPrice = await randomNumber(10, 15);
        const sizeforBuy = Math.floor(randomUsdtPrice / finalPrice);

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
          randomDeodPrice
        );

        // Place Buy order
        const buydetails = await place_order(
          "DEODUSDT",
          "BUY",
          "LIMIT",
          sizeforBuy,
          randomDeodPrice
        );
        console.log(selldetails.orderId);
        console.log(buydetails.orderId);

        console.log("Buy and Sell Done");
      } else {
        console.log("Price range is low");
      }
    } catch (error) {
      console.error("Error:", error);
      await cancel_all_orders("DEODUSDT");
    }
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
};

main();
