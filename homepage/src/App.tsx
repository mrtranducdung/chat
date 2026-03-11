import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import DashboardAgent from './pages/DashboardAgent';
import TaxAutomationAgent from './pages/TaxAutomationAgent';
import BpoSupportAgent from './pages/BpoSupportAgent';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import News from './pages/News';
import About from './pages/About';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="products/dashboard-agent" element={<DashboardAgent />} />
            <Route path="products/tax-automation-agent" element={<TaxAutomationAgent />} />
            <Route path="products/bpo-support-agent" element={<BpoSupportAgent />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="contact" element={<Contact />} />
            <Route path="news" element={<News />} />
            <Route path="about" element={<About />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
