import React, { useState } from 'react';
import { Product, Category, Brand, Supplier } from '../../types';
import { Search, Filter, RefreshCw, AlertTriangle, Package, Trash2, CreditCard as Edit, Eye } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

interface ProductListProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  suppliers: Supplier[];
  getCategoryById: (id: string) => Category | undefined;
  getBrandById: (id: string) => Brand | undefined;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onAddTransaction: (id: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  categories,
  brands,
  getCategoryById,
  getBrandById,
  getSupplierById,
  onEdit,
  onDelete,
  onView,
  onAddTransaction
}) => {
  const { formatCurrency } = useSettings();
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'normal' | 'high'>('all');
  const [expirationFilter, setExpirationFilter] = useState<'all' | 'expiring-soon' | 'good'>('all');

  // Apply filters and search
  const filteredProducts = products.filter(product => {
    // Search term filter
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !product.barcode?.includes(searchTerm)) {
      return false;
    }

    // Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
      return false;
    }

    // Brand filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
      return false;
    }

    // Stock level filter
    if (stockFilter !== 'all') {
      if (stockFilter === 'low' && product.currentStock >= product.minStockLevel) {
        return false;
      }
      if (stockFilter === 'normal' && (product.currentStock < product.minStockLevel || product.currentStock > product.minStockLevel * 2)) {
        return false;
      }
      if (stockFilter === 'high' && product.currentStock <= product.minStockLevel * 2) {
        return false;
      }
    }

    // Expiration filter
    if (expirationFilter !== 'all' && product.expirationDate) {
      const today = new Date();
      const expirationDate = new Date(product.expirationDate);
      const daysDifference = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (expirationFilter === 'expiring-soon' && daysDifference > 30) {
        return false;
      }
      if (expirationFilter === 'good' && daysDifference <= 30) {
        return false;
      }
    }

    return true;
  });

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setStockFilter('all');
    setExpirationFilter('all');
    setSearchTerm('');
  };

  const toggleCategoryFilter = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleBrandFilter = (brandId: string) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">
            <Package className="inline-block mr-2 mb-1" size={20} />
            Lista de Productos
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar producto..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Filter size={18} />
              <span>Filtros</span>
            </button>
            
            {(selectedCategories.length > 0 || selectedBrands.length > 0 || 
              stockFilter !== 'all' || expirationFilter !== 'all') && (
              <button 
                onClick={resetFilters}
                className="flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw size={18} />
                <span>Limpiar</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Categories */}
            <div>
              <h3 className="font-medium mb-2 text-gray-700">Categorías</h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {categories.map(category => (
                  <div key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => toggleCategoryFilter(category.id)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`category-${category.id}`} className="ml-2 text-sm text-gray-700">
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Brands */}
            <div>
              <h3 className="font-medium mb-2 text-gray-700">Marcas</h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {brands.map(brand => (
                  <div key={brand.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`brand-${brand.id}`}
                      checked={selectedBrands.includes(brand.id)}
                      onChange={() => toggleBrandFilter(brand.id)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`brand-${brand.id}`} className="ml-2 text-sm text-gray-700">
                      {brand.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Additional Filters */}
            <div>
              <h3 className="font-medium mb-2 text-gray-700">Nivel de Stock</h3>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="all">Todos</option>
                <option value="low">Stock Bajo</option>
                <option value="normal">Stock Normal</option>
                <option value="high">Stock Alto</option>
              </select>
            </div>
            
            <div>
              <h3 className="font-medium mb-2 text-gray-700">Estado de Vencimiento</h3>
              <select
                value={expirationFilter}
                onChange={(e) => setExpirationFilter(e.target.value as any)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="all">Todos</option>
                <option value="expiring-soon">Por Vencer (30 días)</option>
                <option value="good">Vigentes</option>
              </select>
            </div>
          </div>
        )}
      </div>
      
      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Marca
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Actual
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio Venta
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vencimiento
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500 italic">
                  No se encontraron productos.
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.image ? (
                        <img 
                          src={URL.createObjectURL(new Blob([product.image], { type: product.imageType }))} 
                          alt={product.name} 
                          className="h-10 w-10  rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <Package size={20} className="text-gray-500" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500">{product.barcode || 'Sin código'}</div>
                      </div>
                      {product.currentStock < product.minStockLevel && (
                        <AlertTriangle size={16} className="ml-2 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getCategoryById(product.category)?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getBrandById(product.brand)?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${product.currentStock < product.minStockLevel ? 'text-red-600 font-bold' : 'text-gray-900'}`}>
                      {product.currentStock}
                    </div>
                    <div className="text-xs text-gray-500">Min: {product.minStockLevel}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(product.sellingPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {product.expirationDate ? (
                      <span 
                        className={
                          new Date(product.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                            ? 'text-amber-600 font-medium'
                            : 'text-gray-500'
                        }
                      >
                        {product.expirationDate}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => onView(product.id)} 
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalle"
                      >
                        <Eye size={18} />
                      </button>
                      
                      {hasPermission('edit') && (
                        <button 
                          onClick={() => onEdit(product.id)} 
                          className="text-amber-600 hover:text-amber-900"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                      )}
                      
                      {hasPermission('delete') && (
                        <button 
                          onClick={() => onDelete(product.id)} 
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => onAddTransaction(product.id)}
                        className="ml-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                      >
                        Transacción
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;