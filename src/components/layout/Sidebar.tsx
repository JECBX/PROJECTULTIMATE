import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, LayoutDashboard, Package, ClipboardList, Settings, WifiOff, AlertTriangle } from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';
import { useInventory } from '../../context/InventoryContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isOnline, pendingSyncCount } = useNetwork();
  const { getProductsBelowStock, getProductsExpiringWithinDays } = useInventory();
  
  // Get alert count
  const lowStockCount = getProductsBelowStock().length;
  const expiringCount = getProductsExpiringWithinDays(30).length;
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Inventario', path: '/inventory', icon: <Package size={20} /> },
    { name: 'Transacciones', path: '/transactions', icon: <ClipboardList size={20} /> },
    { name: 'Configuración', path: '/settings', icon: <Settings size={20} /> },
  ];
  
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:block`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <Package className="h-6 w-6 text-blue-600 mr-2" />
              <span className="font-bold text-lg text-gray-900">El Paradero</span>
            </div>
            <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          
          {!isOnline && (
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-center">
              <WifiOff size={16} className="text-amber-600 mr-2" />
              <span className="text-sm text-amber-800">Sin conexión</span>
            </div>
          )}
          
          {pendingSyncCount > 0 && (
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
              <span className="text-sm text-blue-700">Pendientes de sincronizar</span>
              <span className="text-xs font-medium bg-blue-600 text-white px-2 py-0.5 rounded-full">
                {pendingSyncCount}
              </span>
            </div>
          )}
          
          <div className="py-4 flex-grow">
            <ul className="space-y-1">
              {navItems.map(item => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `
                      flex items-center px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors
                      ${isActive ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : ''}
                    `}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                    
                    {item.path === '/' && (lowStockCount > 0 || expiringCount > 0) && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {lowStockCount + expiringCount > 9 ? '9+' : lowStockCount + expiringCount}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            {lowStockCount > 0 && (
              <div className="mb-3 px-3 py-2 bg-red-50 rounded-md flex items-center justify-between">
                <div className="flex items-center text-red-800 text-sm">
                  <AlertTriangle size={16} className="mr-2 text-red-600" />
                  <span>Stock bajo</span>
                </div>
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {lowStockCount}
                </span>
              </div>
            )}
            
            {expiringCount > 0 && (
              <div className="px-3 py-2 bg-amber-50 rounded-md flex items-center justify-between">
                <div className="flex items-center text-amber-800 text-sm">
                  <AlertTriangle size={16} className="mr-2 text-amber-600" />
                  <span>Por vencer</span>
                </div>
                <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {expiringCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;