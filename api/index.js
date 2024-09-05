const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const contactRoutes = require("../routes/contact");
const twilio = require('twilio');
require("dotenv").config();
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

// Routes
app.use("/api", contactRoutes);

app.get("/", (req, res) => {
  res.send("Working");
});


const VoiceResponse = twilio.twiml.VoiceResponse;




const accountSid = process.env.ACCOUNT_SID; 
const authToken = process.env.AUTH_TOKEN; 
const client = twilio(accountSid, authToken);
const yourPhoneNumber = process.env.PHONE_NO; 
const newNum = process.env.NEW_NUM

// Twilio Call to Phone Number
const initiateCall = () => {
  client.calls
    .create({
      url: 'https://9f7e1234.ngrok.io/twiml', 
      to: newNum,
      from: yourPhoneNumber,
    })
    .then(call => console.log(`Call SID: ${call.sid}`))
    .catch(error => console.error(error));
};

// Endpoint to Serve Twilio IVR
app.post('/twiml', (req, res) => {
  const twiml = new VoiceResponse();
  twiml.say('Hello, press 1 to receive your interview link.');
  
  // Gather button press
  twiml.gather({
    numDigits: 1,
    action: '/gather-response',
    method: 'POST',
  });

  res.type('text/xml');
  res.send(twiml.toString());
});

// Endpoint to Handle Button Press
app.post('/gather-response', (req, res) => {
  const buttonPressed = req.body.Digits;

  const twiml = new VoiceResponse();
  if (buttonPressed == '1') {
    twiml.say('Sending the interview link now.');
    sendInterviewLink();
  } else {
    twiml.say('Invalid input, please try again.');
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

// Function to Send Interview Link via SMS
const sendInterviewLink = () => {
  client.messages
    .create({
      body: 'Here is your personalized interview link: https://your-interview-link.com',
      from: yourPhoneNumber,
      to: newNum
    })
    .then(message => console.log(`Message SID: ${message.sid}`))
    .catch(error => console.error(error));
};



// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
