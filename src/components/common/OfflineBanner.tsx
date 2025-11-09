import React, { useState, useEffect } from 'react';
import { useNetwork } from '../../context/NetworkContext';
import { WifiOff, RefreshCw, X } from 'lucide-react';

const OfflineBanner: React.FC = () => {
  const { isOnline, syncPending, pendingSyncCount, syncData } = useNetwork();
  const [dismissed, setDismissed] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  
  // Show banner when going offline
  useEffect(() => {
    if (!isOnline) {
      setDismissed(false);
      setShowBanner(true);
    } else if (syncPending) {
      // If we're syncing, show banner briefly
      setShowBanner(true);
      // Auto-dismiss after sync completes
      const timer = setTimeout(() => {
        setDismissed(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      // Otherwise hide gradually
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, syncPending]);
  
  // Dismiss the banner
  const handleDismiss = () => {
    setDismissed(true);
    
    // Hide with animation
    setTimeout(() => {
      setShowBanner(false);
    }, 300);
  };
  
  if (dismissed && !syncPending) return null;
  
  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 transform ${
        showBanner ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className={`px-4 py-3 flex items-center justify-between ${
        isOnline ? syncPending ? 'bg-blue-600' : 'bg-green-600' : 'bg-amber-600'
      }`}>
        <div className="flex items-center text-white">
          {isOnline ? (
            syncPending ? (
              <>
                <RefreshCw size={18} className="mr-2 animate-spin" />
                <span>Sincronizando datos ({pendingSyncCount} cambios pendientes)...</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-white mr-2"></div>
                <span>Conexión restaurada. Todos los datos están sincronizados.</span>
              </>
            )
          ) : (
            <>
              <WifiOff size={18} className="mr-2" />
              <span>Sin conexión. Los cambios se guardarán localmente.</span>
            </>
          )}
        </div>
        
        <div className="flex items-center">
          {!isOnline && (
            <button 
              onClick={() => window.location.reload()}
              className="mr-2 text-white hover:text-amber-100 transition-colors"
              title="Reintentar conexión"
            >
              <RefreshCw size={18} />
            </button>
          )}
          
          <button 
            onClick={handleDismiss} 
            className="text-white hover:text-amber-100 transition-colors"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflineBanner;