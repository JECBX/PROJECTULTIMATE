import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, Upload, X } from 'lucide-react';
import { Product, Category, Brand } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { db } from '../../db/db';

interface ProductFormProps {
  initialProduct?: Product;
  categories: Category[];
  brands: Brand[];
  onSubmit: (product: Partial<Product>) => void;
  onCancel: () => void;
}

export default function ProductForm({ 
  initialProduct,
  categories,
  brands,
  suppliers,
  onSubmit,
  onCancel 
}: ProductFormProps) {
  const { settings, convertCurrency } = useSettings();
  const [formData, setFormData] = useState({
    name: initialProduct?.name || '',
    description: initialProduct?.description || '',
    category: initialProduct?.category || '',
    brand: initialProduct?.brand || '',
    barcode: initialProduct?.barcode || '',
    currentStock: initialProduct?.currentStock || 0,
    minStockLevel: initialProduct?.minStockLevel || 0,
    purchasePrice: initialProduct ? 
      (settings.currency === 'USD' ? 
        convertCurrency(initialProduct.purchasePrice, 'USD') : 
        initialProduct.purchasePrice) : 0,
    sellingPrice: initialProduct ? 
      (settings.currency === 'USD' ? 
        convertCurrency(initialProduct.sellingPrice, 'USD') : 
        initialProduct.sellingPrice) : 0,
    expirationDate: initialProduct?.expirationDate || ''
  });

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialProduct) {
      setFormData(prev => ({
        ...prev,
        purchasePrice: settings.currency === 'USD' ? 
          convertCurrency(initialProduct.purchasePrice, 'USD') : 
          initialProduct.purchasePrice,
        sellingPrice: settings.currency === 'USD' ? 
          convertCurrency(initialProduct.sellingPrice, 'USD') : 
          initialProduct.sellingPrice
      }));

      // Load existing image if available
      if (initialProduct.image) {
        const blob = new Blob([initialProduct.image], { type: initialProduct.imageType });
        setImagePreview(URL.createObjectURL(blob));
      }
    }
  }, [settings.currency, initialProduct, convertCurrency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let imageData = undefined;
    let imageType = undefined;

    if (selectedImage) {
      const arrayBuffer = await selectedImage.arrayBuffer();
      imageData = arrayBuffer;
      imageType = selectedImage.type;
    }

    const submissionData = {
      ...formData,
      purchasePrice: settings.currency === 'USD' ? 
        convertCurrency(formData.purchasePrice, 'Bs') : 
        formData.purchasePrice,
      sellingPrice: settings.currency === 'USD' ? 
        convertCurrency(formData.sellingPrice, 'Bs') : 
        formData.sellingPrice,
      image: imageData,
      imageType: imageType
    };

    onSubmit(submissionData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'currentStock' || name === 'minStockLevel' || name === 'purchasePrice' || name === 'sellingPrice' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      const category = await db.addCategory(newCategory.trim());
      setFormData(prev => ({ ...prev, category: category.id }));
      setShowNewCategory(false);
      setNewCategory('');
    }
  };

  const handleAddBrand = async () => {
    if (newBrand.trim()) {
      const brand = await db.addBrand(newBrand.trim());
      setFormData(prev => ({ ...prev, brand: brand.id }));
      setShowNewBrand(false);
      setNewBrand('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {initialProduct ? 'Editar Producto' : 'Nuevo Producto'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nombre del Producto
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="barcode" className="block text-sm font-medium text-gray-700">
            Código de Barras
          </label>
          <input
            type="text"
            id="barcode"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Categoría
          </label>
          <div className="mt-1 flex space-x-2">
            {!showNewCategory ? (
              <>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(true)}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  Nueva
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Nueva categoría"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategory(false);
                    setNewCategory('');
                  }}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
            Marca
          </label>
          <div className="mt-1 flex space-x-2">
            {!showNewBrand ? (
              <>
                <select
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar marca</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewBrand(true)}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  Nueva
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  placeholder="Nueva marca"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddBrand}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewBrand(false);
                    setNewBrand('');
                  }}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagen del Producto
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-48 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Subir imagen</span>
                      <input
                        id="image-upload"
                        name="image-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">o arrastrar y soltar</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF hasta 10MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="currentStock" className="block text-sm font-medium text-gray-700">
            Stock Actual
          </label>
          <input
            type="number"
            id="currentStock"
            name="currentStock"
            value={formData.currentStock}
            onChange={handleChange}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="minStockLevel" className="block text-sm font-medium text-gray-700">
            Nivel Mínimo de Stock
          </label>
          <input
            type="number"
            id="minStockLevel"
            name="minStockLevel"
            value={formData.minStockLevel}
            onChange={handleChange}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700">
            Precio de Compra ({settings.currency})
          </label>
          <input
            type="number"
            id="purchasePrice"
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700">
            Precio de Venta ({settings.currency})
          </label>
          <input
            type="number"
            id="sellingPrice"
            name="sellingPrice"
            value={formData.sellingPrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">
            Fecha de Vencimiento
          </label>
          <input
            type="date"
            id="expirationDate"
            name="expirationDate"
            value={formData.expirationDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {initialProduct ? (
            <>
              <Save size={18} className="mr-2" />
              Guardar Cambios
            </>
          ) : (
            <>
              <PlusCircle size={18} className="mr-2" />
              Agregar Producto
            </>
          )}
        </button>
      </div>
    </form>
  );
}