import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useNetwork } from '../../context/NetworkContext';
import { useInventory } from '../../context/InventoryContext';
import { Loader2 } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isOnline } = useNetwork();
  const { loading } = useInventory();
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Close sidebar when route changes
  useEffect(() => {
    setShowSidebar(false);
  }, [location.pathname]);
  
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 text-lg">Cargando inventario...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar onMenuClick={toggleSidebar} isOnline={isOnline} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
        
        <main className="flex-grow px-4 py-6 md:px-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <footer className="bg-white py-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} El Paradero del Cristiano - Sistema de Inventario
          {!isOnline && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
              Modo sin conexión
            </span>
          )}
        </div>
      </footer>
    </div>
  );
};

export default Layout;