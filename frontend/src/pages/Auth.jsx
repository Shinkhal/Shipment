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
  fetchSignInMethodsForEmail,
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
      if (formData.email) {
        const methods = await fetchSignInMethodsForEmail(auth, formData.email);
        if (methods.includes('password')) {
          toast.error("This account is registered with email/password.");
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
          createdAt: new Date().toISOString(),
        });
      }

      toast.success("Signed in with Google!");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Google sign-in failed");
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
          toast.error("Please use Google to sign in.");
          setIsLoading(false);
          return;
        }

        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Logged in!");
      } else {
        if (methods.length > 0) {
          toast.error("Email already in use.");
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
          createdAt: new Date().toISOString(),
        });

        toast.success("Account created!");
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-background p-4">
      <div className="max-w-md w-full bg-surface rounded-2xl p-8 shadow-card">
        <h2 className="text-center text-2xl font-bold text-textPrimary mb-6">
          {isLogin ? 'Welcome Back!' : 'Create an Account'}
        </h2>

        <div className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-sm text-textSecondary">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your Name"
                  disabled={isLoading}
                  className="input-field pl-10"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-sm text-textSecondary">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                disabled={isLoading}
                className="input-field pl-10"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="text-sm text-textSecondary">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary w-5 h-5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="1234567890"
                  disabled={isLoading}
                  className="input-field pl-10"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-sm text-textSecondary">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="********"
                disabled={isLoading}
                className="input-field pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-primary"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm flex items-center gap-2 cursor-pointer text-textSecondary">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="accent-primary"
              />
              Remember Me
            </label>
            {isLogin && (
              <button
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-primary hover:underline"
              >
                Forgot Password?
              </button>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
          >
            {isLoading
              ? isLogin
                ? "Signing In..."
                : "Creating..."
              : isLogin
              ? "Sign In"
              : "Sign Up"}
          </button>

          <div className="text-center text-sm text-textSecondary my-4">OR</div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 flex justify-center items-center border border-border rounded-lg bg-white hover:bg-gray-50 transition"
          >
            <FcGoogle size={20} className="mr-2" />
            Continue with Google
          </button>

          <p className="text-center text-sm text-textSecondary mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={toggleMode}
              className="ml-1 text-primary hover:underline font-medium"
              disabled={isLoading}
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center mt-6">
          <div className="text-textSecondary">
            <Package className="mx-auto text-primary w-6 h-6" />
            <p className="text-xs mt-1">Tracking</p>
          </div>
          <div className="text-textSecondary">
            <Truck className="mx-auto text-primary w-6 h-6" />
            <p className="text-xs mt-1">Fast Delivery</p>
          </div>
          <div className="text-textSecondary">
            <User className="mx-auto text-primary w-6 h-6" />
            <p className="text-xs mt-1">24/7 Support</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPages;
