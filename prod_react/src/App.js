import React, {useEffect, useState} from 'react';
import p5 from "p5";
import {Link, BrowserRouter as Router, Routes, Route, useNavigate} from 'react-router-dom';
import {motion, stagger} from 'framer-motion'
import sketch from "./sketch"
import './index.css'

function App() {

  

  const [user, setuser] = useState("...")

    useEffect(() => {


      const fetchCompletedChallengeData = async () => {
        try {
          const response = await fetch('https://www.commandcracker.com/completed-challenge-fetch', {
            method: 'GET',
            credentials: 'include', 
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
    
          const data = await response.json(); 

          for (const entry of data){
            console.log("One"+entry.challenge_number)
            nodes[parseInt(entry.challenge_number)].state = "completed"
            nodes[parseInt(entry.challenge_number)].challenge_name = entry.challenge_name
            nodes[parseInt(entry.challenge_number)].challenge_difficulty = entry.challenge_difficulty
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
    
      const fetchUnlockedChallengeData = async () => {
        try {
          const response = await fetch('https://www.commandcracker.com/unlocked-challenge-fetch', {
            method: 'GET',
            credentials: 'include', 
          });
    
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
    
          const data = await response.json(); 
          for (const entry of data){
            nodes[parseInt(entry.challenge_number)].state = "unlocked"
            nodes[parseInt(entry.challenge_number)].challenge_name = entry.challenge_name
            nodes[parseInt(entry.challenge_number)].challenge_difficulty = entry.challenge_difficulty
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
    
      const fetchuserdata = async () => {
        try {
          const response = await fetch('https://www.commandcracker.com/user-data-fetch', {
            method: 'GET',
            credentials: 'include', 
          });
    
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
    
          const data = await response.json(); 
          console.log("Meow data"+ data)
          setuser(data)
       
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
    
      fetchuserdata();
      fetchUnlockedChallengeData();
      fetchCompletedChallengeData();
    }, []);
        

  let nodes = [
    {x: 0, y: 300, state: "unlocked"},               // Root node
    { x: -180, y: 220, state: "locked"},             // Left child of root
    { x: 160, y: 230,state: "locked"},               // Right child of root 
    { x: -270, y: 140,state: "locked"},             // Left child of node 1
    { x: -120, y: 130,state: "locked"},               // Right child of node 1
    { x: 70, y: 150,state: "locked"},               // Left child of node 1
    { x: 240, y: 130,state: "locked"},              // Right child of node 2
    { x: -320, y: 50,state: "locked"},              // Left child of node 3
    { x: -230, y: 30,state: "locked"},              // Right child of node 3
    { x: -170, y: 60,state: "locked"},              // Left child of node 4
    { x: -80, y: 40,state: "locked"},               // Right child of node 4
    { x: 20, y: 70,state: "locked"},                // Left child of node 5
    { x: 120, y: 60,state: "locked"},               // Right child of node 5
    { x: 190, y: 50,state: "locked"},               // Left child of node 6
    { x: 300, y: 20,state: "locked"}           // Right child of node 6
  ];
  
  let edges = [
    [0, 1], [0, 2], 
    [1, 3], [1, 4], 
    [2, 5], [2, 6], 
    [3, 7], [3, 8], 
    [4, 9], [4, 10], 
    [5, 11], [5, 12], 
    [6, 13], [6, 14]
  ];

  
  const [current_descriptor, swtich_descriptor] = useState(-1)
  let navigate = useNavigate()


  const redirector = (index, isNodeClickable) => {
    if (isNodeClickable){
    navigate("/challenge", {state: { message: index }, replace: true });
    }
  }

  const switch_challenge_descriptor = (index) => {
    if  (!(nodes[index].state == 'unlocked' || nodes[index].state == "completed")){swtich_descriptor("Still Locked!")}
    else{swtich_descriptor(nodes[index].challenge_name +". Level: " + nodes[index].challenge_difficulty)}
  }

  useEffect(()=>{
  
  }, [current_descriptor])


  useEffect(() => {
      new p5((p) => {sketch(p, redirector, switch_challenge_descriptor, nodes, edges)}, 'p5-container'); 
  }, []);

  

  let daysaway = 5

  return (
    <>
        <div className='challenge-container'>
            <div className='challenge-pick-title landing-font'>Hey <span className='amazing-text'>{user.username}</span>, choose a daily challenge...</div>
            <motion.div className='challenge-info-container'
                    key={current_descriptor} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ type: "spring", stiffness: 200 }}
            >
            <h3 className='landing-font'> {current_descriptor == -1 ? `You are on a ${daysaway} day streak! 🔥` : current_descriptor}</h3>
            </motion.div>
            <div
                    className="min-size-p5"
                    
                    id="p5-container"
                    style={{
                      width: "100vw",
                      height: "calc(100vh / 1.75)",
                      opacity: 0,               // <--- invisible at start
                      transition: "opacity 0.8  s"
                    }}
                  >
              

        </div>
      

</div>
    </>
  )
}

export default App;