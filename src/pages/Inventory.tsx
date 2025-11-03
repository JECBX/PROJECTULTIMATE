import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import ProductList from '../components/inventory/ProductList';
import ProductForm from '../components/inventory/ProductForm';
import TransactionForm from '../components/transactions/TransactionForm';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Inventory: React.FC = () => {
  const { 
    products, 
    categories, 
    brands, 
    suppliers, 
    getCategoryById, 
    getBrandById, 
    getSupplierById, 
    getProductById, 
    addProduct, 
    updateProduct, 
    deleteProduct,
    addTransaction 
  } = useInventory();
  
  const { hasPermission } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [transactionProductId, setTransactionProductId] = useState<string | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Check if there's a product ID in the URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const productId = params.get('product');
    
    if (productId) {
      const product = getProductById(productId);
      if (product) {
        setEditProductId(productId);
      }
    }
  }, [location, getProductById]);

  const handleAddClick = () => {
    setShowAddForm(true);
    setEditProductId(null);
    setTransactionProductId(null);
  };

  const handleEditClick = (id: string) => {
    setEditProductId(id);
    setShowAddForm(false);
    setTransactionProductId(null);
    
    // Update URL
    navigate(`/inventory?product=${id}`);
  };

  const handleViewClick = (id: string) => {
    setEditProductId(id);
    setShowAddForm(false);
    setTransactionProductId(null);
    
    // Update URL
    navigate(`/inventory?product=${id}`);
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      deleteProduct(id);
      
      // Clear URL params if we're deleting the currently selected product
      if (editProductId === id) {
        setEditProductId(null);
        navigate('/inventory');
      }
    }
  };

  const handleAddTransaction = (id: string) => {
    setTransactionProductId(id);
    setShowAddForm(false);
    setEditProductId(null);
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditProductId(null);
    setTransactionProductId(null);
    
    // Clear URL params
    navigate('/inventory');
  };

  const handleAddSubmit = (product: any) => {
    addProduct(product);
    setShowAddForm(false);
  };

  const handleEditSubmit = (product: any) => {
    if (editProductId) {
      updateProduct(editProductId, product);
      setEditProductId(null);
      
      // Clear URL params
      navigate('/inventory');
    }
  };

  const handleTransactionSubmit = (transaction: any) => {
    addTransaction(transaction);
    setTransactionProductId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
        
        {!showAddForm && !editProductId && !transactionProductId && hasPermission('add') && (
          <button
            onClick={handleAddClick}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-1" />
            Agregar Producto
          </button>
        )}
      </div>
      
      {/* Add/Edit Product Form */}
      {showAddForm && hasPermission('add') && (
        <ProductForm
          categories={categories}
          brands={brands}
          suppliers={suppliers}
          onSubmit={handleAddSubmit}
          onCancel={handleFormCancel}
        />
      )}
      
      {/* Edit Product Form */}
      {editProductId && hasPermission('edit') && (
        <ProductForm
          initialProduct={getProductById(editProductId)}
          categories={categories}
          brands={brands}
          suppliers={suppliers}
          onSubmit={handleEditSubmit}
          onCancel={handleFormCancel}
        />
      )}
      
      {/* Transaction Form */}
      {transactionProductId && (
        <TransactionForm
          products={products}
          initialProductId={transactionProductId}
          onSubmit={handleTransactionSubmit}
          onCancel={handleFormCancel}
        />
      )}
      
      {/* Product List */}
      {!showAddForm && !editProductId && !transactionProductId && (
        <ProductList
          products={products}
          categories={categories}
          brands={brands}
         suppliers={suppliers}
          getCategoryById={getCategoryById}
          getBrandById={getBrandById}
         getSupplierById={getSupplierById}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onView={handleViewClick}
          onAddTransaction={handleAddTransaction}
        />
      )}
    </div>
  );
};

export default Inventory;