import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FaskesDashboard from './pages/FaskesDashboard';
import DataCommand from './pages/DataCommand';
import LiterasiPortal from './pages/LiterasiPortal';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FaskesDashboard />} />
        <Route path="/dashboard" element={<FaskesDashboard />} />
        <Route path="/command" element={<DataCommand />} />
        <Route path="/literasi" element={<LiterasiPortal />} />
      </Routes>
    </BrowserRouter>
  );
}
