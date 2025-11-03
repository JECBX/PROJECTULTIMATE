import React, { useState } from 'react';
import { Product, MultiTransaction, TransactionItem, Supplier } from '../../types';
import { X, ArrowDown, ArrowUp, Plus, Trash2, ShoppingCart, DollarSign } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface MultiTransactionFormProps {
  products: Product[];
  onSubmit: (transaction: Omit<MultiTransaction, 'id' | 'transactionNumber' | 'syncStatus'>) => void;
  onCancel: () => void;
}

const MultiTransactionForm: React.FC<MultiTransactionFormProps> = ({
  products,
  onSubmit,
  onCancel
}) => {
  const { formatCurrency, settings } = useSettings();
  const [formData, setFormData] = useState({
    type: 'exit' as 'entry' | 'exit',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    createdBy: 'Admin',
    buyerName: '',
    supplierName: ''
  });

  const [items, setItems] = useState<TransactionItem[]>([
    { productId: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [priceUpdateMode, setPriceUpdateMode] = useState<Record<number, boolean>>({});
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', phone: '', email: '' });

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof TransactionItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-calculate prices when product or quantity changes
    if (field === 'productId' || field === 'quantity') {
      const product = products.find(p => p.id === newItems[index].productId);
      if (product) {
        // Only auto-set price if not in manual price update mode
        if (!priceUpdateMode[index]) {
          const price = formData.type === 'exit' ? product.sellingPrice : product.purchasePrice;
          newItems[index].unitPrice = price;
        }
        newItems[index].totalPrice = newItems[index].unitPrice * newItems[index].quantity;
      }
    }

    // Recalculate total when unit price changes
    if (field === 'unitPrice') {
      newItems[index].totalPrice = (value as number) * newItems[index].quantity;
    }

    setItems(newItems);
  };

  const getTotalAmount = () => {
    return items.reduce((total, item) => total + item.totalPrice, 0);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.buyerName.trim() && formData.type === 'exit') {
      newErrors.buyerName = 'El nombre del comprador es requerido para ventas';
    }
    
    if (!formData.supplierName.trim() && formData.type === 'entry') {
      newErrors.supplierName = 'El nombre del proveedor es requerido para entradas';
    }

    items.forEach((item, index) => {
      if (!item.productId) {
        newErrors[`item_${index}_product`] = 'Selecciona un producto';
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'La cantidad debe ser mayor a 0';
      }

      // Validate stock for exits
      if (formData.type === 'exit' && item.productId) {
        const product = products.find(p => p.id === item.productId);
        if (product && item.quantity > product.currentStock) {
          newErrors[`item_${index}_quantity`] = `Solo hay ${product.currentStock} unidades disponibles`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  const confirmSubmit = () => {
    const transaction = {
      ...formData,
      items: items.filter(item => item.productId), // Only include items with selected products
      totalAmount: getTotalAmount()
    };
    onSubmit(transaction);
  };

  const togglePriceUpdateMode = (index: number) => {
    setPriceUpdateMode(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getProductCurrentPrice = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    return formData.type === 'exit' ? product.sellingPrice : product.purchasePrice;
  };

  const handleAddSupplier = async () => {
    if (newSupplier.name.trim()) {
      const supplier = await db.addSupplier(
        newSupplier.name.trim(),
        newSupplier.contact.trim() || undefined,
        newSupplier.phone.trim() || undefined,
        newSupplier.email.trim() || undefined
      );
      setFormData(prev => ({ ...prev, supplierName: supplier.name }));
      setShowNewSupplier(false);
      setNewSupplier({ name: '', contact: '', phone: '', email: '' });
    }
  };

  if (showConfirmation) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirmar Transacción</h2>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Resumen de la Transacción</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Tipo:</span>
                <span className="ml-2 font-medium">
                  {formData.type === 'entry' ? 'Entrada' : 'Salida'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Fecha:</span>
                <span className="ml-2 font-medium">{formData.date}</span>
              </div>
              {formData.buyerName && (
                <div>
                  <span className="text-gray-600">Comprador:</span>
                  <span className="ml-2 font-medium">{formData.buyerName}</span>
                </div>
              )}
              {formData.supplierName && (
                <div>
                  <span className="text-gray-600">Proveedor:</span>
                  <span className="ml-2 font-medium">{formData.supplierName}</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Total:</span>
                <span className="ml-2 font-bold text-lg text-green-600">
                  {formatCurrency(getTotalAmount())}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Productos:</h4>
            <div className="space-y-2">
              {items.filter(item => item.productId).map((item, index) => {
                const product = products.find(p => p.id === item.productId);
                return (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>{product?.name}</span>
                    <span>
                      {item.quantity} x {formatCurrency(item.unitPrice)} = {formatCurrency(item.totalPrice)}
                      {formData.type === 'exit' && item.purchasePrice && (
                        <span className="text-xs text-gray-500 block">
                          Compra: {formatCurrency(item.purchasePrice)}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowConfirmation(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Volver a Editar
            </button>
            <button
              onClick={confirmSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Confirmar Transacción
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Nueva Transacción</h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
        
        {formData.type === 'entry' && (
          <div>
            <label htmlFor="supplierName" className="block text-sm font-medium text-gray-700 mb-1">
              Proveedor <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-2">
              {!showNewSupplier ? (
                <>
                  <select
                    id="supplierName"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    className={`flex-1 rounded-md shadow-sm ${errors.supplierName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                  >
                    <option value="">Seleccionar proveedor</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.name}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewSupplier(true)}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 whitespace-nowrap"
                  >
                    Nuevo
                  </button>
                </>
              ) : (
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    placeholder="Nombre del proveedor *"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newSupplier.contact}
                      onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                      placeholder="Contacto"
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <input
                      type="tel"
                      value={newSupplier.phone}
                      onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                      placeholder="Teléfono"
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <input
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    placeholder="Email"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleAddSupplier}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewSupplier(false);
                        setNewSupplier({ name: '', contact: '', phone: '', email: '' });
                      }}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
            {errors.supplierName && <p className="mt-1 text-sm text-red-600">{errors.supplierName}</p>}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transaction Type and Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Transacción
            </label>
            <div className="flex space-x-2">
              <label className={`flex-1 flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer ${formData.type === 'entry' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-300 text-gray-700'}`}>
                <input
                  type="radio"
                  name="type"
                  value="entry"
                  checked={formData.type === 'entry'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'entry' | 'exit' })}
                  className="sr-only"
                />
                <ArrowDown size={18} className="mr-2 text-green-600" />
                Entrada
              </label>
              
              <label className={`flex-1 flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer ${formData.type === 'exit' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-300 text-gray-700'}`}>
                <input
                  type="radio"
                  name="type"
                  value="exit"
                  checked={formData.type === 'exit'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'entry' | 'exit' })}
                  className="sr-only"
                />
                <ArrowUp size={18} className="mr-2 text-red-600" />
                Salida
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {formData.type === 'exit' && (
            <div>
              <label htmlFor="buyerName" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Comprador <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="buyerName"
                value={formData.buyerName}
                onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                className={`w-full rounded-md shadow-sm ${errors.buyerName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                placeholder="Ingrese el nombre del comprador"
              />
              {errors.buyerName && <p className="mt-1 text-sm text-red-600">{errors.buyerName}</p>}
            </div>
          )}
        </div>

        {/* Products Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800 flex items-center">
              <ShoppingCart size={20} className="mr-2" />
              Productos
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              <Plus size={16} className="mr-1" />
              Agregar Producto
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Producto
                    </label>
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(index, 'productId', e.target.value)}
                      className={`w-full rounded-md shadow-sm ${errors[`item_${index}_product`] ? 'border-red-300' : 'border-gray-300'}`}
                    >
                      <option value="">Seleccionar producto</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - Stock: {product.currentStock}
                        </option>
                      ))}
                    </select>
                    {errors[`item_${index}_product`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_product`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      className={`w-full rounded-md shadow-sm ${errors[`item_${index}_quantity`] ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    {errors[`item_${index}_quantity`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_quantity`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Unitario
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      {item.productId && (
                        <button
                          type="button"
                          onClick={() => togglePriceUpdateMode(index)}
                          className={`px-2 py-2 text-xs rounded-md transition-colors ${
                            priceUpdateMode[index] 
                              ? 'bg-green-100 text-green-700 border border-green-300'
                              : 'bg-gray-100 text-gray-700 border border-gray-300'
                          }`}
                          title={priceUpdateMode[index] ? 'Actualizar precio en inventario' : 'Usar precio actual'}
                        >
                          {priceUpdateMode[index] ? '💾' : '🔒'}
                        </button>
                      )}
                    </div>
                    {item.productId && priceUpdateMode[index] && (
                      <p className="text-xs text-green-600 mt-1">
                        💾 Este precio se guardará en el inventario
                        <br />
                        <span className="text-gray-500">
                          Actual: {formatCurrency(getProductCurrentPrice(item.productId))}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-medium">
                        {formatCurrency(item.totalPrice)}
                      </div>
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Price Update Information for Sales */}
                {formData.type === 'exit' && item.productId && (
                  <div className="md:col-span-5 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">💰 Información de Precios</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Precio de Compra:</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.purchasePrice || 0}
                            onChange={(e) => updateItem(index, 'purchasePrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                            placeholder="Precio de compra"
                          />
                          <span className="text-blue-600 text-xs">{settings.currency}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-blue-700">Precio de Venta:</span>
                        <div className="text-blue-800 font-medium mt-1">
                          {formatCurrency(item.unitPrice)}
                        </div>
                      </div>
                    </div>
                    {priceUpdateMode[index] && (
                      <div className="mt-2 text-xs text-green-600">
                        ✅ Los precios se actualizarán en el inventario después de la transacción
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Total Amount */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-800 flex items-center">
              <DollarSign size={20} className="mr-2 text-green-600" />
              Total de la Transacción:
            </span>
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(getTotalAmount())}
            </span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notas
          </label>
          <textarea
            id="notes"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Detalles adicionales..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Revisar Transacción
          </button>
        </div>
      </form>
    </div>
  );
};

export default MultiTransactionForm;