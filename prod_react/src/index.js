import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Appx from './Appx';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(    
    
    <BrowserRouter>
        <Routes>
            <Route path="/challenge" element={<Appx/>}/>
            <Route path="/" element={<App/>}/>
        </Routes>
    </BrowserRouter>,

);

