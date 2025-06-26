import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, Phone, Eye, EyeOff, Truck, Package,
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-toastify';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  updateProfile,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const AuthPages = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    // Navigate to home if user exists
    if (!authLoading && user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: "", email: "", phone: "", password: "" });
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();

      // Optional: user already typed email, check for conflicts
      if (formData.email) {
        const methods = await fetchSignInMethodsForEmail(auth, formData.email);
        if (methods.includes('password')) {
          toast.error("This account is registered with email/password. Please sign in using email.");
          setIsLoading(false);
          return;
        }
      }

      const result = await signInWithPopup(auth, provider);
      const { user } = result;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          phone: '',
          createdAt: new Date().toISOString()
        });
      }

      toast.success("Google sign-in successful!");
      // Navigation will be handled by useEffect
    } catch (error) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        toast.error("Account exists with different sign-in method.");
      } else {
        console.error('Google sign-in error:', error);
        toast.error(error.message || "Google sign-in failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    const { email, password, name, phone } = formData;

    if (!email || !password || (!isLogin && (!name || !phone))) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!isLogin && password.length < 6) {
      toast.warning("Password should be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      const methods = await fetchSignInMethodsForEmail(auth, email);

      if (isLogin) {
        if (methods.includes('google.com')) {
          toast.error("This account was created using Google. Please sign in with Google.");
          setIsLoading(false);
          return;
        }
        
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Login successful!");
        // Navigation will be handled by useEffect
      } else {
        if (methods.length > 0) {
          toast.error("This email is already registered with another method.");
          setIsLoading(false);
          return;
        }

        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: name });

        await setDoc(doc(db, 'users', userCred.user.uid), {
          uid: userCred.user.uid,
          name,
          email,
          phone,
          createdAt: new Date().toISOString()
        });

        toast.success("Account created successfully!");
        // Navigation will be handled by useEffect
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-3xl p-8 shadow-lg">
        <h2 className="text-center text-2xl font-bold text-gray-700">
          {isLogin ? 'Welcome Back!' : 'Create an Account'}
        </h2>

        <div className="space-y-4">
          {!isLogin && (
            <>
              <label className="block text-sm text-gray-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your Name"
                  disabled={isLoading}
                  className="pl-10 pr-3 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </>
          )}

          <label className="block text-sm text-gray-700">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              disabled={isLoading}
              className="pl-10 pr-3 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {!isLogin && (
            <>
              <label className="block text-sm text-gray-700">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="1234567890"
                  disabled={isLoading}
                  className="pl-10 pr-3 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </>
          )}

          <label className="block text-sm text-gray-700">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="********"
              disabled={isLoading}
              className="pl-10 pr-10 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              Remember Me
            </label>
            {isLogin && (
              <button 
                onClick={() => navigate("/forgot-password")} 
                className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
              >
                Forgot Password?
              </button>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-3 text-white font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isLoading ? (isLogin ? "Signing In..." : "Creating...") : (isLogin ? "Sign In" : "Sign Up")}
          </button>

          <div className="relative text-center my-4">
            <hr className="border-gray-300" />
            <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-gray-400 text-sm">
              OR
            </span>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 flex justify-center items-center border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FcGoogle size={20} className="mr-2" />
            Continue with Google
          </button>

          <p className="text-center text-sm mt-4 text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={toggleMode}
              className="ml-1 text-purple-600 hover:text-purple-700 hover:underline font-medium"
              disabled={isLoading}
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center mt-6">
          <div className="text-gray-600">
            <Package className="mx-auto text-purple-600 w-6 h-6" />
            <p className="text-xs mt-1">Tracking</p>
          </div>
          <div className="text-gray-600">
            <Truck className="mx-auto text-pink-600 w-6 h-6" />
            <p className="text-xs mt-1">Fast Delivery</p>
          </div>
          <div className="text-gray-600">
            <User className="mx-auto text-orange-600 w-6 h-6" />
            <p className="text-xs mt-1">24/7 Support</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPages;