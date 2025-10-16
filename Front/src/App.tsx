import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetail from './pages/CampaignDetail';
import CampaignEdit from './pages/CampaignEdit';
import Login from './pages/Login';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Indicators from './pages/Indicators';
import Reports from './pages/Reports';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Ruta de login (solo referencia, no se usa para proteger acceso) */}
            <Route path="/login" element={<Login />} />

            {/* Rutas principales accesibles sin autenticación */}
            <Route path="/" element={<Layout />}>
              {/* Dashboard principal */}
              <Route index element={<Dashboard />} />

              {/* Gestión de campañas */}
              <Route path="campaigns" element={<Campaigns />} />
              <Route path="campaigns/create" element={<CreateCampaign />} />
              <Route path="campaigns/:id" element={<CampaignDetail />} />
              <Route path="campaigns/:id/edit" element={<CampaignEdit />} />

              {/* Nuevas rutas */}
              <Route path="indicators" element={<Indicators />} />
              <Route path="reports" element={<Reports />} />

              {/* Redirección por defecto */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;