import { Terminal } from "@xterm/xterm";
import { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Download, Award} from 'lucide-react';
import "@xterm/xterm/css/xterm.css";
import "./index.css";
import "./mobile.css";
import Confetti from 'react-confetti'
import {motion, stagger} from 'framer-motion'
import {Link, BrowserRouter as Router, Routes, Route, useNavigate} from 'react-router-dom';
import Pointbar from './Pointbar'
import Popup from './Popup';



const downloadCertificate = () => {
  const link = document.createElement('a');
  link.href = 'Certificate.jpeg'; // Assuming this image is in the 'public' folder
  link.download = 'Certificate.jpeg'; // Desired filename
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function joinSingleLetterNeighbors(arr) {
  const result = [];
  let buffer = "";

  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] === "string" && arr[i].length === 1) {
      buffer += arr[i]; 
    } else {

      if (buffer) {
        result.push(buffer);
        buffer = ""; 
      }
      result.push(arr[i]); 
    }
  }

  // Push any remaining buffered letters
  if (buffer) {
    result.push(buffer);
  }
  return result;
}

export default function Appx() {
  let navigate = useNavigate()
  const [isExploding, setIsExploding] = useState(false);
  const terminalRef = useRef(null);
  const ws = useRef(null);
  const termRef = useRef(null);
  const [responses, setResponses] = useState([]);
  const [aiResponses, setAiResponses] = useState([]);
  const [hintCount, setHintCount] = useState(0);
  const [showModal, setShowModal] = useState(true); // State to control modal visibility
  const [cmdlogs, appendcmdlogs] = useState([]);
  const colourarr = ['green', '#FFBF00', 'orange', 'red'];
  const [isExpanded, setIsExpanded] = useState(false);
  const [points, setPoints] = useState(100);
  const [hintvisible, sethintvisible] = useState(true)
  const [usertime, setusertime] = useState(true)
  const [isClicked, setIsClicked] = useState(false);
  const [userpercentile, setuserpercentile] = useState(0)
  const [challenge_id, setchallenge_id] = useState(-1)
  const [fetched_challenge_data, set_fetched_challenge_data] = useState(null)
  const [commandlog, appendCommandLog] = useState("")
  const [messages, setMessages] = useState([]);
    const [showNFTCelebrationModal, setShowNFTCelebrationModal] = useState(false);
    
    // Function to trigger the celebration modal (call this when user completes challenges)
    const triggerCelebration = () => {

      console.log(showNFTCelebrationModal)
      setShowNFTCelebrationModal(true);
    };


    const endering_terms = ["Excellent Work, Agent!",
                            "Superb work hacker!",
                            "Epic Exploit ;)",
                            "Data = Found"
  ]

  const location = useLocation();

  const termParent = useRef(null)

  const portHelp = "A port is like a door on a server that allows data to come in or go out. Each service on a server uses a specific port to communicate. In this challenge, an unexpected port is open, meaning there’s a hidden 'door' you can use to access data. Your task is to find this open port and extract the data from it."
  const serverHelp = "A server is a computer that provides data or services to other computers, called clients. When a client requests something (like a webpage), the server processes the request and sends back the response. Think of it like a kitchen in a restaurant—clients place orders, and the server delivers the food (data)."

  
  const toggleSection = (event) => {
    setIsExpanded(prevState => !prevState);
  };


useEffect(() => {

  ws.current = new WebSocket(`wss://www.commandcracker.com/api/challenge_id=${location.state?.message}`);

  ws.current.onopen = () => {

    if (location.state?.message !== undefined) {
      ws.current.send(
        JSON.stringify({
          type: "id",
          data: `${location.state?.message}`,
        })
      );
    }

      ws.current.send(
        JSON.stringify({
          type: "cookieauth",
          data: document.cookie,
        })
      );
    
  };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "data" && termRef.current) {
        termRef.current.write(data.data);

        setResponses((prevResponses) => [...prevResponses, data.data]);
      }
      if (data.type === "flag"){
        setIsExploding(true)
        setusertime(data.content.time)
        setuserpercentile(data.content.percentile)
      }
    };

    return () => {
      ws.current?.close();
    };
  }, []);



  useEffect(() => {

  
    const fetchChallengeData = async () => {
      
    console.log("Current Node: " + location.state?.message)
    try{
      const response = await fetch('https://www.commandcracker.com/api/challenge_data_request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      credentials: 'include',
      body: JSON.stringify({challenge_id: location.state?.message}),  
    })

    const data = await response.json();
    set_fetched_challenge_data(data.content)
  }
  catch(err){
    console.log(err)
  }
  }
  fetchChallengeData()
}
,[])

// Calculate terminal dimensions based on device size
const calculateTerminalDimensions = () => {
  // Get the container dimensions
  const containerWidth = window.innerWidth;
  const containerHeight = window.innerHeight;
  
  // Calculate character dimensions
  // These values represent the approximate width and height of a character in pixels
  // You may need to adjust these based on your font size
  const charWidth = 9;  // Approximate width of a character in pixels
  const charHeight = 20; // Approximate height of a character in pixels
  
  // Calculate available space (accounting for padding/margins)
  const availableWidth = containerWidth * 0.9;  // 90% of container width
  const availableHeight = containerHeight * 0.4; // 40% of container height
  
  // Calculate rows and columns
  const columns = Math.floor(availableWidth / charWidth);
  const rows = Math.floor(availableHeight / charHeight);
  
  // Set reasonable minimum and maximum values
  const finalColumns = Math.min(Math.max(columns, 40), 120);
  const finalRows = Math.min(Math.max(rows, 10), 30);
  
  return { rows: finalRows, cols: finalColumns };
};

const handlePaste = (event) => {
  event.preventDefault();
  const pastedText = event.clipboardData.getData('text');
  if (termRef.current) {
    console.log('Pasting into terminal:', pastedText);
    termRef.current.write(pastedText);
  } else {
    console.warn('termRef.current is null');
  }
};




window.addEventListener('paste', () => {
  console.log("Meow");
  termRef.current.write("meow??");
});



  useEffect(() => {
    if (!terminalRef.current) return;
    if (!termParent.current) return;
    

    const dimensions = calculateTerminalDimensions();
  
    termRef.current = new Terminal({
      theme: {
        foreground: "#EEEEEE",
        background: "rgba(46, 47, 51, 0.0)",
        cursor: "#CFF5DB"
      },
      allowTransparency: true,
      cols: dimensions.cols
    });


    

    





    

    termRef.current.open(terminalRef.current);



    const onKey = (e) => {
      if (ws.current) {
        ws.current.send(
          JSON.stringify({
            type: "command",
            data: e.key,
          })
        );
      }
    };





    termRef.current.onKey(onKey);

    

    

    return () => {
      termRef.current?.dispose();
    };
  }, [terminalRef]);

  
  useEffect(() => {
    if (!fetched_challenge_data) return; // exit early if null or undefined
    setMessages((prevMessages) => [...prevMessages, { role: "system", content: fetched_challenge_data.challenge_prompt}]);


  }, [fetched_challenge_data]);

  const handleRunCompletion = async () => {
    setAiResponses("I'm thinking!")
    try {
      const data = joinSingleLetterNeighbors(responses).join("\n"); //Reponses is an array of commandline ouptuts.
      setMessages((prevMessages) => [...prevMessages, { role: "user", content: data}]); 



      fetch('https://www.commandcracker.com/api/code_cat_request', {

            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ messages }),
          })
          .then(response => response.text())
          .then(text => {
            return JSON.parse(text); 
          })
          .then(data => {console.log(data.content); setAiResponses(data.content); setMessages((prevMessages) => [...prevMessages, { role: "system", content: data.content}]); })
          .catch(error => console.error('Error:', error));
      


    } catch (error) {
      console.error("Error in runCompletion:", error);
    }
  };
  const constraintsRef = useRef<HTMLDivElement>(null)
  
  return (

    <>

    <Pointbar title={fetched_challenge_data ? fetched_challenge_data.challenge_name : "Loading"}/>
    <motion.div 
        style={{filter: isExploding ? 'blur(5px)' : 'none'}}
        ref={constraintsRef} variants={{
        hidden: { opacity: 0.7},
        show:{transition:{staggerChildren:0.25}, opacity:1}}} 
        initial="hidden" animate="show" className="layout-container">

<motion.div variants={{hidden:{opacity:0}, show:{opacity:1}}} onClick={()=>{toggleSection()}} className="coolborder instructions-parent">
  <h2>
    <code className="instructions-title">Challenge Overview </code>  
  </h2>
  <div className={`toggle-content ${isExpanded ? "expanded" : "collapsed"}`}>
    <span>
      <br></br>
      <span><code className="instructions-content">{fetched_challenge_data ? fetched_challenge_data.challenge_description : "Loading"}</code></span>


      </span>
  </div>
</motion.div>
<motion.div variants={{hidden:{opacity:0}, show:{opacity:1}}}className="coolborder code-cat-parent">
  <div className="upper-half">
    <div className="bubble-parent">
      <div className="bubble">
      <div>
      <code className="code-container">
        {aiResponses.length === 0 ? "Meow! 🐱 You can ask me for a hint on the challenge! You have four hints" : aiResponses}
      </code>
      </div>
      <div className="inner-bubble"></div>
      </div>
    </div>
    
    <motion.img
    className="cat-img"
    whileHover={{ scale: 1.05}}
    whileTap={{ scale: 0.9 }}
    dragElastic={0.1} onClick={handleRunCompletion} src="https://i.ibb.co/MgBn1FL/kitten-cat-cat-pixel-pixelart-mug-removebg-preview.png" alt="Cat"/>
  </div>
<div style={{display:'flex', justifyContent:'start'}}>
  <motion.button
    whileHover={{ scale: 1.05}}
    whileTap={{ scale: 0.9 }}

    onClick={handleRunCompletion}
    style={{
      fontWeight:1000,
      marginTop:0,
    }}><span><code className="code-cat-button-text">Ask Code Cat</code></span><span></span></motion.button>
    </div>
</motion.div>

      <motion.div ref={termParent} variants={{hidden:{opacity:0}, show:{opacity:1}}}  className="coolborder terminal-parent">
        <div
          style={{  
            flex: 1,
            borderRadius: "8px",
            padding: "10px",
            overflow: "hidden",
            width: "100%",
            height: "100vh",
            overflow: 'hidden',
          }}
        >
          <div
            ref={terminalRef}
            style={{
              width: "100%",
              height: "100%",
              overflow: 'hidden',
              scrollbarWidth: "0",
            }}
          ></div>
        </div>  
      </motion.div>
    </motion.div>
    

    <motion.div className="modal-overlay">
      {isExploding && (
      <motion.div className="modal-inner"    
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        style={{textAlign:'center'}}>

        {location.state?.message < 7 ? (
          <>
            <h1 style={{ color: 'black', fontWeight: 600 }} className="landing-font">
              {endering_terms[2]}
            </h1>
            <span style={{ color: 'black' }}>
              Well done! You completed the challenge in {usertime / 1000} seconds
            </span>
            <div style={{color:'black'}}>You are one step closer to getting your bonus NFT</div>
            <button onClick={() => navigate("/")}>Back Home</button>
          </>
        ) : (
          <>
            <h1 style={{ color: 'black', fontWeight: 600 }} className="landing-font">
              {endering_terms[2]}
            </h1>
            <span style={{ color: 'black' }}>
              You reached one of the final challenges, so you have unlocked some CodeCat art!
            </span>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <button
                onClick={downloadCertificate}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download />
                <span>Download Your Certificate</span>
              </button>
            </div>
            <button onClick={() => navigate("/")}>Back Home</button>
          </>
        )}





      </motion.div>)}
    </motion.div>

    <div className="confetti-overlay">
      
      {isExploding && (<Confetti width={window.innerWidth} height={window.innerHeight} tweenDuration={4000}/>)}
    </div>
    
    <div className="absolute-view">

      <div className="pop-up-parent">
    
       
     </div>
  </div>
  
    </>

  );
}


