import { useState } from "react";
import styles from "./CustomProgressBar.module.css"; // Import the module CSS
import { motion, AnimatePresence } from "framer-motion";
import {Link, BrowserRouter as Router, Routes, Route, useNavigate} from 'react-router-dom';

export default function Pointbar({title}) {

  let navigate = useNavigate()


  return (
    <motion.div 
      style={{zIndex:10}}
      className={styles.container} 
      whileTap={{ scale: 0.90 }} // Adds a nice tap effect
      
    >
      <div onClick={()=>{
      navigate("/");
      }} className={`${styles.backbutton} ${styles.coolborder}`}>
          <img src='back.svg'></img>
      </div>
      <div className={`${styles.title} ${styles.landingfont}`}>{title}</div>
    </motion.div>
  );
}

