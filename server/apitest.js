const { GoogleGenAI } = require('@google/genai');

// 1. Paste your new API key here locally (Do not paste it back into this chat!)
const myApiKey = 'AIzaSyAZo40KYCTOGjN7T6dMtsKYfABDDH4zNKk'; 

const ai = new GoogleGenAI({ apiKey: myApiKey });

async function testConnection() {
  console.log("⏳ Connecting to Google Gemini 3.5 Flash...");
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'Respond with exactly: "API Connection Successful! I am ready to code."',
    });
    
    console.log("\n✅ SUCCESS! The AI replied:");
    console.log("-----------------------------------");
    console.log(response.text);
    console.log("-----------------------------------");
    
  } catch (error) {
    console.log("\n❌ FAILED! Here is the exact error:");
    console.log("-----------------------------------");
    console.log("Status:", error.status);
    console.log("Message:", error.message);
    console.log("-----------------------------------");
  }
}

testConnection();