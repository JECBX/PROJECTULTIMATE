import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';

const DEFAULT_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    role: UserRole.Admin,
    displayName: 'Administrador',
    email: 'admin@elparadero.com',
    createdAt: '2024-01-01',
    isActive: true
  },
  {
    id: '2',
    username: 'empleado',
    role: UserRole.Employee,
    displayName: 'Empleado',
    email: 'empleado@elparadero.com',
    createdAt: '2024-01-01',
    isActive: true
  }
];

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  currentUser: User | null;
  hasPermission: (action: 'view' | 'add' | 'edit' | 'delete') => boolean;
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<User>;
  updateUser: (id: string, updates: Partial<User>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const storedUsers = localStorage.getItem('systemUsers');
    return storedUsers ? JSON.parse(storedUsers) : DEFAULT_USERS;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    return storedAuth === 'true';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      return users.find(user => user.username === storedUser) || null;
    }
    return null;
  });

  // Update localStorage when users change
  const updateUsersStorage = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('systemUsers', JSON.stringify(newUsers));
  };

  const login = async (username: string, password: string) => {
    const user = users.find(u => u.username === username.trim().toLowerCase() && u.isActive);
    
    if (user && password.trim() === 'paradero') {
      setIsAuthenticated(true);
      setCurrentUser(user);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', user.username);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
  };

  const hasPermission = (action: 'view' | 'add' | 'edit' | 'delete') => {
    if (!currentUser) return false;
    
    if (currentUser.role === UserRole.Admin) {
      return true; // Admin can do everything
    }
    
    if (currentUser.role === UserRole.Employee) {
      return action === 'view' || action === 'add'; // Employee can only view and add
    }
    
    return false;
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    const newUsers = [...users, newUser];
    updateUsersStorage(newUsers);
    return newUser;
  };

  const updateUser = async (id: string, updates: Partial<User>): Promise<User> => {
    const newUsers = users.map(user => 
      user.id === id ? { ...user, ...updates } : user
    );
    updateUsersStorage(newUsers);
    
    const updatedUser = newUsers.find(u => u.id === id);
    if (!updatedUser) throw new Error('Usuario no encontrado');
    
    // Update current user if it's the one being updated
    if (currentUser?.id === id) {
      setCurrentUser(updatedUser);
    }
    
    return updatedUser;
  };

  const deleteUser = async (id: string): Promise<void> => {
    if (currentUser?.id === id) {
      throw new Error('No puedes eliminar tu propio usuario');
    }
    
    const newUsers = users.filter(user => user.id !== id);
    updateUsersStorage(newUsers);
  };

  const toggleUserStatus = async (id: string): Promise<void> => {
    if (currentUser?.id === id) {
      throw new Error('No puedes desactivar tu propio usuario');
    }
    
    const user = users.find(u => u.id === id);
    if (user) {
      await updateUser(id, { isActive: !user.isActive });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout, 
      currentUser, 
      hasPermission,
      users,
      addUser,
      updateUser,
      deleteUser,
      toggleUserStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};