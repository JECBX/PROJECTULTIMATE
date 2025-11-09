import React, { useState, useEffect } from 'react';
import { useNetwork } from '../context/NetworkContext';
import { useInventory } from '../context/InventoryContext';
import { Database, WifiOff, RefreshCw, Download, HardDrive, Upload, Book } from 'lucide-react';
import CurrencySettings from '../components/settings/CurrencySettings';
import UserManual from '../components/settings/UserManual';
import { useAuth } from '../context/AuthContext';

const Settings: React.FC = () => {
  const { isOnline, lastSynced, syncPending, syncData } = useNetwork();
  const { pendingSyncCount } = useInventory();
  const { currentUser, hasPermission } = useAuth();
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showManual, setShowManual] = useState(false);
  
  // Listen for the beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleInstallClick = () => {
    if (!installPromptEvent) return;
    
    installPromptEvent.prompt();
    
    installPromptEvent.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPromptEvent(null);
    });
  };
  
  const handleSyncClick = () => {
    if (isOnline) {
      syncData();
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <button
            onClick={() => setShowManual(!showManual)}
            className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <Book size={20} className="mr-2" />
            {showManual ? 'Ocultar Manual' : 'Ver Manual de Usuario'}
          </button>
        </div>
        
        {/* User Info */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <div className="flex items-center px-6 py-4 bg-gray-50">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-blue-600 font-medium text-sm">
                  {currentUser?.displayName.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{currentUser?.displayName}</h3>
                <p className="text-sm text-gray-500">
                  {currentUser?.role === 'admin' ? 'Administrador - Todos los permisos' : 'Empleado - Solo consultar y agregar'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full mr-2 ${hasPermission('view') ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Consultar</span>
              </div>
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full mr-2 ${hasPermission('add') ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Agregar</span>
              </div>
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full mr-2 ${hasPermission('edit') ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Editar</span>
              </div>
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full mr-2 ${hasPermission('delete') ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Eliminar</span>
              </div>
            </div>
          </div>
        </div>
        
        {showManual && (
          <div className="mb-6">
            <UserManual />
          </div>
        )}
        
        {/* Currency Settings */}
        {hasPermission('edit') && (
          <div className="mb-6">
            <CurrencySettings />
          </div>
        )}
        
        {/* Network Status */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <div className="flex items-center px-6 py-4 bg-gray-50">
              <Database className="mr-2 text-blue-500" size={20} />
              <h3 className="text-lg font-medium text-gray-900">Estado de Sincronización</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {isOnline ? (
                  <div className="flex items-center text-green-600">
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="font-medium">Online</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="font-medium">Offline</span>
                  </div>
                )}
              </div>
              
              <button 
                onClick={handleSyncClick}
                disabled={!isOnline || syncPending}
                className={`flex items-center px-3 py-1 rounded-md text-sm transition-colors ${
                  isOnline ? 
                    'bg-blue-100 text-blue-700 hover:bg-blue-200' : 
                    'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <RefreshCw size={16} className={`mr-1 ${syncPending ? 'animate-spin' : ''}`} />
                Sincronizar Ahora
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-md p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Última sincronización:</span>
                <span className="text-gray-900 font-medium">
                  {lastSynced ? new Date(lastSynced).toLocaleString() : 'Nunca'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cambios pendientes:</span>
                <span className={`font-medium ${pendingSyncCount > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                  {pendingSyncCount} {pendingSyncCount === 1 ? 'elemento' : 'elementos'}
                </span>
              </div>
            </div>
            
            {!isOnline && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start">
                <WifiOff size={20} className="text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Estás en modo sin conexión. Los cambios que realices se guardarán localmente y se sincronizarán cuando vuelvas a conectarte.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Storage Management */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <div className="flex items-center px-6 py-4 bg-gray-50">
              <HardDrive className="mr-2 text-blue-500" size={20} />
              <h3 className="text-lg font-medium text-gray-900">Almacenamiento Local</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="bg-gray-50 rounded-md p-4">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-600">Espacio utilizado:</span>
                <span className="text-gray-900 font-medium">~3.2 MB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">
                <Download size={18} className="mr-2" />
                Exportar Datos
              </button>
              <button className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">
                <Upload size={18} className="mr-2" />
                Importar Datos
              </button>
            </div>
          </div>
        </div>
        
        {/* App Installation */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex items-center px-6 py-4 bg-gray-50">
              <Download className="mr-2 text-blue-500" size={20} />
              <h3 className="text-lg font-medium text-gray-900">Instalación de la Aplicación</h3>
            </div>
          </div>
          
          <div className="p-6">
            {isStandalone ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
                <div className="h-5 w-5 rounded-full bg-green-500 mr-2 flex-shrink-0 flex items-center justify-center text-white">
                  ✓
                </div>
                <p className="text-sm text-green-800">
                  La aplicación está instalada y funcionando como una aplicación independiente.
                </p>
              </div>
            ) : installPromptEvent ? (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800 mb-4">
                  Instala esta aplicación en tu dispositivo para acceder más rápido y trabajar sin conexión.
                </p>
                <button 
                  onClick={handleInstallClick}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Download size={18} className="mr-2" />
                  Instalar Aplicación
                </button>
              </div>
            ) : (
              <p className="text-gray-600 text-sm">
                Esta aplicación se puede instalar para uso sin conexión. Use el botón "Instalar" o "Agregar a pantalla de inicio" en el menú de su navegador.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;