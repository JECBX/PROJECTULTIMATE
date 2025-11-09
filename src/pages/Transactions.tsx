import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import TransactionList from '../components/transactions/TransactionList';
import MultiTransactionForm from '../components/transactions/MultiTransactionForm';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Transactions: React.FC = () => {
  const { multiTransactions, products, getProductById, addMultiTransaction, deleteMultiTransaction } = useInventory();
  const { hasPermission } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddClick = () => {
    setShowAddForm(true);
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
  };

  const handleFormSubmit = async (transaction: any) => {
    await addMultiTransaction(transaction);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transacciones</h1>
        
        {!showAddForm && hasPermission('add') && (
          <button
            onClick={handleAddClick}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-1" />
            Nueva Transacción
          </button>
        )}
      </div>
      
      {showAddForm && hasPermission('add') ? (
        <MultiTransactionForm
          products={products}
          suppliers={suppliers}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      ) : (
        <TransactionList
          transactions={multiTransactions}
          products={products}
          getProductById={getProductById}
          onDelete={hasPermission('delete') ? deleteMultiTransaction : async () => {}}
        />
      )}
    </div>
  );
};

export default Transactions;