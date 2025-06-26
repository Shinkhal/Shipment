// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

/**
 * Fetches user data from Firestore users collection.
 * @param {string} uid - Firebase UID
 * @returns {Promise<object|null>}
 */
const fetchUserData = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        uid: data.uid || uid,
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || '',
      };
    } else {
      console.warn('No Firestore user found for UID:', uid);
      return null;
    }
  } catch (error) {
    console.error('Firestore user fetch error:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('Shipmenttoken');
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [navigate]);

  const refreshUser = useCallback(async () => {
    const rawUser = auth.currentUser;
    if (!rawUser) return;

    try {
      const token = await rawUser.getIdToken(true);
      localStorage.setItem('Shipmenttoken', token);

      const firestoreUser = await fetchUserData(rawUser.uid);
      const mergedUser = firestoreUser || {
        name: rawUser.displayName || '',
        email: rawUser.email || '',
        phone: '',
        uid: rawUser.uid,
        createdAt: rawUser.metadata?.creationTime || '',
        updatedAt: new Date().toISOString(),
      };

      setUser(mergedUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (rawUser) => {
      console.log('Auth state change:', rawUser);

      if (rawUser) {
        try {
          const token = await rawUser.getIdToken();
          localStorage.setItem('Shipmenttoken', token);

          const firestoreUser = await fetchUserData(rawUser.uid);
          setUser(
            firestoreUser || {
              name: rawUser.displayName || '',
              email: rawUser.email || '',
              phone: '',
              uid: rawUser.uid,
              createdAt: rawUser.metadata?.creationTime || '',
              updatedAt: new Date().toISOString(),
            }
          );
        } catch (error) {
          console.error('Error during login setup:', error);
          setUser(null);
        }
      } else {
        localStorage.removeItem('Shipmenttoken');
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        refreshUser,
        currentUser: user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
