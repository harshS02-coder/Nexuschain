import { Routes, Route } from 'react-router';
import { useEffect } from 'react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Shipments from './pages/Shipments';
import Network from './pages/Network';
import RoutesPage from './pages/RoutesPage';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import { siteConfig } from './config';

function App() {
  useEffect(() => {
    document.title = siteConfig.siteTitle || '';
    document.documentElement.lang = siteConfig.language || '';

    let metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = siteConfig.siteDescription || '';
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/shipments" element={<Shipments />} />
      <Route path="/network" element={<Network />} />
      <Route path="/routes" element={<RoutesPage />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
