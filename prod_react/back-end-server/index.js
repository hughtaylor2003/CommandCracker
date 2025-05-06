import http from 'node:http';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { spawn } from 'node-pty';
import express from "express";
import cors from "cors";
import net from 'net';
import OpenAI from "openai";
import dotenv from "dotenv";
import mongoose from 'mongoose';
import fs from 'fs';

dotenv.config();

const uri = process.env.DB_PASSWORD;

let globalResult = null;

const PlayerScoreSchema = new mongoose.Schema({
  playerID: { type: String, required: true },
  timeCompleted: { type: String, required: true },
});

const PlayerScore = mongoose.model('PlayerScore', PlayerScoreSchema);

const ChallengeSchema = new mongoose.Schema({
  challenge_number: { type: String, required: true},
  challenge_prompt: { type: String, required: true},
  challenge_description: { type: String, required: true},
  challenge_flag: { type: String, required: true},
});

const Challenge = mongoose.model('Challenge', ChallengeSchema);

const EdgeSchema = new mongoose.Schema({
  source: { type: Number, required: true },
  target: { type: Number, required: true }
}, { collection: 'challenge_tree' });

const Edges = mongoose.model('challenge_tree', EdgeSchema);

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  unlocked: { type: [String], default: [] },  // Array of strings for 'unlocked'
  completed: { type: [String], default: [] }, // Array of strings for 'completed'
});


const User = mongoose.model('User', UserSchema);


const connectDB = async () => {
    return await mongoose.connect(uri)
        .then(() => console.log("Connected to MongoDB!"))
        .catch(err => console.error("Error connecting to MongoDB:", err));
};  



const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
  dangerouslyAllowBrowser: true,
});
export const createServer = () => {
  const app = express();
  app.use(express.json());
  return app;
};

const port = process.env.PORT || 5002;


const app = createServer();

const server = http.createServer(app);

server.listen(port, "0.0.0.0", () => {
  console.log(`HTTP Server running at http://0.0.0.0:${port}`);
});

  app.use(cors({
    origin: ["http://localhost:3000", "https://commandcracker.com","https://www.commandcracker.com"],
    credentials: true
  }));    


const wss = new WebSocketServer({server});

async function doAnalysis(userTime) {
  try {
    const deets = await PlayerScore.find({}, { timeCompleted: 1, _id: 0 });
    let times = deets.map(entry => parseInt(entry.timeCompleted, 10)).filter(time => !isNaN(time));
    if (times.length === 0) {
      console.log("No valid time entries found.");
      return;
    }

    times.sort((a, b) => a - b);
    let userRank = times.findIndex(time => time >= userTime);
    if (userRank === -1) userRank = times.length;
    let percentile = (userRank / times.length) * 100;
    return percentile.toFixed(2);

  } catch (error) {
    console.error("Error analyzing times:", error);
  }
}

wss.on('connection', async (ws, req) => {
  
  ws.userStartTime = Date.now();
  ws.id = uuidv4();

  const urlParams = new URLSearchParams(req.url.slice(1));
  const challenge_id = urlParams.get('challenge_id');

  const ptyProcess = spawn(`/home/azureuser/script${challenge_id}.sh`, [], {
    name: 'xterm-color',
    env: process.env,

  });

  ws.on('message', async (message) => {
    
    try {
      const data = JSON.parse(message.toString());
      if(data.type == "id"){
        const result = await fetch_challenge_data(data.data);
        ws.target_flag = result.challenge_flag

      }
      else if(data.type == "cookieauth"){
        ws.frontendcookie = data.data
          console.log("IMPORTANT"+data.data)
      }
      else{
      // console.log(data)
      ptyProcess.write(data.data);
      // console.log(`received command: ${data.data}`);
      }

    } catch (error) {
      console.log(`Invalid JSON: ${message}`);
      ws.send(JSON.stringify({  
        type: "error",
        data: "Invalid JSON format"
      }));
    }
  });

  ptyProcess.onData(async (data) => {
    process.stdout.write(data);
    const message = JSON.stringify({
      type: "data",
      data
    });
    ws.send(message);

    if (message.includes(ws.target_flag)){
      console.log(ws.target_flag)
      console.log("COKER "+ ws.frontendcookie)
      try {
      
        const userobj = await fetchuserdata(ws.frontendcookie);

        console.log(userobj)

        const children = await Edges.find({ source: Number(challenge_id)});
        const child_arr = []
        for (const child of children){
          child_arr.push(child.target.toString())
        }
        await updateUser(userobj.username,child_arr,challenge_id);


      } catch (error) {
        console.error('Error finding children:', error);
        throw error;
      }

    
            
      const elapsedTime = (Date.now() - ws.userStartTime).toString();
      const uniqueID = (ws.id).toString();
      connectDB();
      const percentile = await doAnalysis(elapsedTime);
      const playerscore = new PlayerScore({playerID:uniqueID, timeCompleted:elapsedTime});
      try{
        playerscore.save();
      }
      catch(err){err + " Saving entry"}
      
      const flagMessage = JSON.stringify({
        type: "flag",
        content:{time:elapsedTime, percentile:percentile}
      });
      ws.send(flagMessage);
    }
  });

  ws.on('close', () => {
  });
});

const openPort = 31337;
const openPortServer = net.createServer((socket) => {
  console.log("Connection received on the mistakenly open port!");
  socket.write("Welcome to the secret service!\n");
  socket.write("Your flag is: ctf2024\n");
  socket.end();
});

openPortServer.listen(openPort, () => {
  console.log(`Mistakenly open port listening on ${openPort}`);
});



app.post('/code_cat_request', async (req, res) => {

  const { messages } = req.body;

  console.log(messages)

  
  const result = await call_openapi_api(messages);

  res.json({ success: true, content: result });

});

async function call_openapi_api(messages) {

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    const reply = completion.choices[0].message.content;

    return reply;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
} 

app.post('/challenge_data_request', async (req, res) => {
  const result = await fetch_challenge_data(req.body.challenge_id);
  
  res.json({ success: true, content: result });
});

async function fetch_challenge_data(challenge_id) {
  connectDB();
  try {
    const challenge = await Challenge.findOne({ challenge_number: challenge_id.toString()});
    return challenge;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

app.post('/landing-page', async (req, res) => {
  
  const result = await fetch_all_challenges();
  res.json({ success: true, content: result });

});

async function fetch_all_challenges(challenge_id) {

  connectDB();
  try {
    const challenges = await Challenge.find();
    const completedChallenges = await Challenge.find({
      challenge_number: { $in: user.completed } // Match all challenge numbers in the user's completed list
    });

    return completedChallenges
  } catch (err) {
    console.error(err);
    throw err;
  }
}

const fetchuserdata = async (cookie) => {
  try {
    const response = await fetch('https://www.commandcracker.com/user-data-fetch', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const data = await response.json(); 
    return (data)
 
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

async function updateUser(username, unlockedItems, completedItem) {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { username: username }, 
      {
        $push: {
          unlocked: { $each: unlockedItems }, // Add items to 'unlocked'
          completed: completedItem, // Add one item to 'completed'
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      console.log('User not found.');
    } else {
      console.log('Updated user:', updatedUser);
    }
  } catch (err) {
    console.log('Error updating user:', err);
  }
}