/*import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}*/

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import InvoicesPage from './pages/InvoicesPage';
import SchedulesPage from './pages/SchedulesPage';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <BrowserRouter>
      {user && <Navbar />}
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/invoices" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/invoices" />} />
          <Route path="/invoices" element={user ? <InvoicesPage /> : <Navigate to="/login" />} />
          <Route path="/schedules" element={user ? <SchedulesPage /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to="/invoices" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;