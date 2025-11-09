import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Package, Bell, User, WifiOff, LogOut } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
  isOnline: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, isOnline }) => {
  const location = useLocation();
  const { getProductsBelowStock, getProductsExpiringWithinDays, pendingSyncCount } = useInventory();
  const { logout, currentUser } = useAuth();
  
  // Get alert count
  const lowStockCount = getProductsBelowStock().length;
  const expiringCount = getProductsExpiringWithinDays(30).length;
  const totalAlerts = lowStockCount + expiringCount;
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/inventory':
        return 'Inventario';
      case '/transactions':
        return 'Transacciones';
      case '/settings':
        return 'Configuración';
      default:
        return '';
    }
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      logout();
    }
  };
  
  return (
    <nav className="bg-blue-600 text-white shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-md hover:bg-blue-500 focus:outline-none"
            >
              <Menu size={24} />
            </button>
            
            <div className="flex-shrink-0 flex items-center ml-2 md:ml-0">
              <Package className="h-8 w-8 mr-2" />
              <span className="font-bold text-xl hidden md:block">El Paradero del Cristiano</span>
              <span className="font-bold text-xl md:hidden">El Paradero</span>
            </div>
            
            <div className="hidden md:flex items-center ml-10">
              <span className="text-lg font-medium text-blue-100">{getPageTitle()}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {!isOnline && (
              <div className="flex items-center text-amber-200">
                <WifiOff size={18} className="mr-1" />
                <span className="text-sm font-medium">Offline</span>
              </div>
            )}
            
            {pendingSyncCount > 0 && (
              <div className="hidden md:flex items-center text-blue-200">
                <span className="text-xs px-2 py-0.5 bg-blue-700 rounded-full">
                  {pendingSyncCount} {pendingSyncCount === 1 ? 'cambio' : 'cambios'} pendiente{pendingSyncCount === 1 ? '' : 's'}
                </span>
              </div>
            )}
            
            <Link 
              to="/" 
              className="relative p-2 rounded-full hover:bg-blue-500 transition-colors"
              title={`Usuario: ${currentUser?.displayName} (${currentUser?.role})`}
            >
              <Bell size={20} />
              {totalAlerts > 0 && (
                <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {totalAlerts > 9 ? '9+' : totalAlerts}
                </span>
              )}
            </Link>
            
            <div className="flex items-center space-x-2">
              <Link 
                to="/settings" 
                className="p-2 rounded-full hover:bg-blue-500 transition-colors"
                title={`Usuario: ${currentUser}`}
              >
                <User size={20} />
              </Link>
              
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-blue-500 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;