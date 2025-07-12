
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  createdAt: Date;
  lastLogin: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock user database for demo purposes
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@stackit.com',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin&options[gender]=female',
    bio: 'StackIt administrator and community moderator.',
    location: 'San Francisco, CA',
    website: 'https://stackit.com',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app start
    const storedUser = localStorage.getItem('stackit_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Convert date strings back to Date objects
        userData.createdAt = new Date(userData.createdAt);
        userData.lastLogin = new Date(userData.lastLogin);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('stackit_user');
      }
    }
    setIsLoading(false);
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): { isValid: boolean; error?: string } => {
    if (password.length < 6) {
      return { isValid: false, error: 'Password must be at least 6 characters long' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one lowercase letter' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one uppercase letter' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one number' };
    }
    return { isValid: true };
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    if (!validateEmail(email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user exists in mock database
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!existingUser) {
      // For demo purposes, create a new user if they don't exist
      const newUser: User = {
        id: Date.now().toString(),
        username: email.split('@')[0],
        email: email.toLowerCase(),
        role: 'user',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}&options[gender]=female`,
        bio: 'Passionate developer who loves solving problems and sharing knowledge.',
        location: 'Unknown',
        website: '',
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      mockUsers.push(newUser);
      setUser(newUser);
      localStorage.setItem('stackit_user', JSON.stringify(newUser));
      return { success: true };
    }

    // Update last login
    existingUser.lastLogin = new Date();
    setUser(existingUser);
    localStorage.setItem('stackit_user', JSON.stringify(existingUser));
    return { success: true };
  };

  const register = async (username: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!username || !email || !password) {
      return { success: false, error: 'All fields are required' };
    }

    if (username.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters long' };
    }

    if (!validateEmail(email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.error };
    }

    // Check if username or email already exists
    const existingUser = mockUsers.find(u => 
      u.username.toLowerCase() === username.toLowerCase() || 
      u.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return { success: false, error: 'Username or email already exists' };
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newUser: User = {
      id: Date.now().toString(),
      username,
      email: email.toLowerCase(),
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}&options[gender]=female`,
      bio: 'Passionate developer who loves solving problems and sharing knowledge.',
      location: 'Unknown',
      website: '',
      createdAt: new Date(),
      lastLogin: new Date()
    };
    
    mockUsers.push(newUser);
    setUser(newUser);
    localStorage.setItem('stackit_user', JSON.stringify(newUser));
    return { success: true };
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const updatedUser = { ...user, ...updates };
    
    // Update in mock database
    const userIndex = mockUsers.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      mockUsers[userIndex] = updatedUser;
    }
    
    setUser(updatedUser);
    localStorage.setItem('stackit_user', JSON.stringify(updatedUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stackit_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      register, 
      logout, 
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
