import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import AddPage from './pages/AddPage'
import ShowPage from './pages/ShowPage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/add" element={<AddPage />} />
        <Route path="/show" element={<ShowPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
