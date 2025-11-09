import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { InventoryProvider } from './context/InventoryContext';
import { NetworkProvider } from './context/NetworkContext';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './components/auth/LoginPage';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';
import OfflineBanner from './components/common/OfflineBanner';
import InstallPrompt from './components/common/InstallPrompt';
import VerificationPrompt from './components/common/VerificationPrompt';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <OfflineBanner />
      <InstallPrompt />
      <VerificationPrompt />
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <NetworkProvider>
        <SettingsProvider>
          <InventoryProvider>
            <Router>
              <AppRoutes />
            </Router>
          </InventoryProvider>
        </SettingsProvider>
      </NetworkProvider>
    </AuthProvider>
  );
}

export default App;