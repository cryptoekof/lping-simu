import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Simulator from './pages/Simulator';
import Positions from './pages/Positions';
import Learn from './pages/Learn';
import Calculator from './pages/Calculator';
import FlashLoan from './pages/FlashLoan';
import './i18n';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/positions" element={<Positions />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/flash-loan" element={<FlashLoan />} />
            <Route path="/learn" element={<Learn />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
