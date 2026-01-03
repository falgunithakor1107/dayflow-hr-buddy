import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types/hrms';
import { mockUsers } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
}

interface SignupData {
  employeeId: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app, this would call backend
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password.length >= 6) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    // Mock signup - in real app, this would call backend
    const newUser: User = {
      id: String(mockUsers.length + 1),
      employeeId: data.employeeId,
      email: data.email,
      name: data.name,
      role: data.role,
      department: 'Unassigned',
      designation: 'New Employee',
      phone: '',
      address: '',
      joinDate: new Date().toISOString().split('T')[0],
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
