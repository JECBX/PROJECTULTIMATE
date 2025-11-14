import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, UserRole } from '../../types';
import { Users, Plus, CreditCard as Edit, Trash2, Eye, EyeOff, Shield, UserCheck, UserX } from 'lucide-react';

const UserManagement: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, toggleUserStatus, currentUser } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    email: '',
    role: 'employee' as 'admin' | 'employee',
    isActive: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      username: '',
      displayName: '',
      email: '',
      role: 'employee',
      isActive: true
    });
    setErrors({});
    setShowAddForm(false);
    setEditingUser(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    } else {
      // Check if username already exists (except when editing)
      const existingUser = users.find(u => 
        u.username.toLowerCase() === formData.username.toLowerCase() && 
        u.id !== editingUser?.id
      );
      if (existingUser) {
        newErrors.username = 'Este nombre de usuario ya existe';
      }
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'El nombre completo es requerido';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
      } else {
        await addUser(formData);
      }
      resetForm();
    } catch (error) {
      setErrors({ submit: 'Error al guardar el usuario' });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      displayName: user.displayName,
      email: user.email || '',
      role: user.role,
      isActive: user.isActive
    });
    setShowAddForm(true);
  };

  const handleDelete = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('No puedes eliminar tu propio usuario');
      return;
    }

    if (window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${user.displayName}"?`)) {
      try {
        await deleteUser(user.id);
      } catch (error) {
        alert('Error al eliminar el usuario');
      }
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('No puedes desactivar tu propio usuario');
      return;
    }

    try {
      await toggleUserStatus(user.id);
    } catch (error) {
      alert('Error al cambiar el estado del usuario');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
          <div className="flex items-center">
            <Users className="mr-2 text-blue-500" size={20} />
            <h3 className="text-lg font-medium text-gray-900">Gestión de Usuarios</h3>
          </div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Nuevo Usuario
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {showAddForm ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h4>
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de Usuario <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`w-full rounded-md shadow-sm ${
                    errors.username ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="usuario123"
                />
                {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
              </div>

              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className={`w-full rounded-md shadow-sm ${
                    errors.displayName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="Juan Pérez"
                />
                {errors.displayName && <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full rounded-md shadow-sm ${
                    errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="usuario@email.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Rol <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'employee' })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="employee">Empleado</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Usuario activo
              </label>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingUser ? 'Actualizar' : 'Crear'} Usuario
              </button>
            </div>
          </form>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {user.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.displayName}
                            {user.id === currentUser?.id && (
                              <span className="ml-2 text-xs text-blue-600">(Tú)</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                          {user.email && (
                            <div className="text-xs text-gray-400">{user.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        <Shield size={12} className="mr-1" />
                        {user.role === 'admin' ? 'Administrador' : 'Empleado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? (
                          <>
                            <UserCheck size={12} className="mr-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <UserX size={12} className="mr-1" />
                            Inactivo
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar usuario"
                        >
                          <Edit size={16} />
                        </button>
                        
                        {user.id !== currentUser?.id && (
                          <>
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={`${
                                user.isActive 
                                  ? 'text-red-600 hover:text-red-900' 
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                              title={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                            >
                              {user.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            
                            <button
                              onClick={() => handleDelete(user)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar usuario"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!showAddForm && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Información sobre usuarios:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Administradores:</strong> Tienen acceso completo al sistema</li>
              <li>• <strong>Empleados:</strong> Solo pueden consultar y agregar productos/transacciones</li>
              <li>• <strong>Contraseña por defecto:</strong> "paradero" para todos los usuarios</li>
              <li>• Los usuarios inactivos no pueden iniciar sesión</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;