const axios = require("axios");
require("dotenv").config();

async function test() {

  const apiKey = process.env.GEMINI_API_KEY;

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;


  const response = await axios.get(url);


  console.log("Modèles disponibles :");

  response.data.models.forEach((model) => {

    console.log(
      "\n",
      model.name,
      "\nMéthodes:",
      model.supportedGenerationMethods
    );

  });

}


test().catch((error)=>{

  console.log(
    error.response?.data || error.message
  );

});