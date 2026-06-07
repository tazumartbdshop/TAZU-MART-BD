import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Smartphone, User, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { useCustomerStore } from '../store/useCustomerStore';
import { useModeratorStore } from '../store/useModeratorStore';
import { useLoginHistoryStore } from '../store/useLoginHistoryStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useWebsitesStore } from '../store/useWebsitesStore';
import { cn } from '../lib/utils';
import { pixelService } from '../utils/pixelService';

export default function Login() {
  const { settings } = useSettingsStore();
  const ADMIN_EMAIL = (settings.adminEmail && settings.adminEmail !== "admin@tazumart.com" ? settings.adminEmail : "admin.tazumartbd@gmail.com").toLowerCase().trim();
  const ADMIN_PASSWORD = settings.adminPassword && settings.adminPassword !== "12345678" ? settings.adminPassword : "8963885522";

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuthStore();
  const { customers } = useCustomerStore();

  const from = location.state?.from?.pathname || '/account/dashboard';
  const adminFrom = location.state?.from?.pathname || '/admin';

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      if (user?.role === 'admin') {
        navigate(adminFrom, { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, navigate, user, isLoading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your credentials');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const normalizedIdentifier = identifier.toLowerCase().trim();
      const isEmail = normalizedIdentifier.includes('@');
      const loginEmail = isEmail ? normalizedIdentifier : `${identifier.trim()}@tazumart.com`;

      // 1. Check Dynamic Website Admin First
      if (isEmail) {
        const websites = useWebsitesStore.getState().websites;
        const matchedSite = websites.find(w => w.admin_email.toLowerCase().trim() === normalizedIdentifier && w.admin_password === password);
        
        if (matchedSite) {
          let firebaseUser;
          try {
            const authResult = await signInWithEmailAndPassword(auth, loginEmail, password);
            firebaseUser = authResult.user;
          } catch (err: any) {
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
              try {
                const authResult = await createUserWithEmailAndPassword(auth, loginEmail, password);
                firebaseUser = authResult.user;
              } catch (createErr: any) {
                if (createErr.code === 'auth/operation-not-allowed') {
                  firebaseUser = { uid: `local_siteadmin_${matchedSite.domain}`, email: loginEmail };
                } else {
                  throw createErr;
                }
              }
            } else if (err.code === 'auth/operation-not-allowed') {
              firebaseUser = { uid: `local_siteadmin_${matchedSite.domain}`, email: loginEmail };
            } else {
              throw err;
            }
          }

          if (firebaseUser) {
            try {
              await setDoc(doc(db, 'users', firebaseUser.uid), {
                uid: firebaseUser.uid,
                name: matchedSite.website_name + ' Admin',
                email: matchedSite.admin_email,
                phone: '',
                role: 'admin',
                status: 'Active',
                createdAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
              }, { merge: true });
            } catch (fsErr) {
              handleFirestoreError(fsErr, OperationType.WRITE, `users/${firebaseUser.uid}`);
            }

            useLoginHistoryStore.getState().addLoginEvent({
              name: matchedSite.website_name + ' Admin',
              email: matchedSite.admin_email,
              method: 'Manual Login',
              password: password,
            });

            login({
              id: firebaseUser.uid,
              name: matchedSite.website_name + ' Admin',
              email: matchedSite.admin_email,
              role: 'admin',
              permissions: ['all']
            });

            navigate(`/site-admin/${matchedSite.domain}`);
            return;
          }
        }

        // 2. Check Admin
        if (normalizedIdentifier === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          let firebaseUser;
          try {
            const authResult = await signInWithEmailAndPassword(auth, loginEmail, password);
            firebaseUser = authResult.user;
          } catch (err: any) {
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
              try {
                const authResult = await createUserWithEmailAndPassword(auth, loginEmail, password);
                firebaseUser = authResult.user;
              } catch (createErr: any) {
                if (createErr.code === 'auth/operation-not-allowed') {
                  firebaseUser = { uid: 'local_superadmin_uid', email: loginEmail };
                } else {
                  throw createErr;
                }
              }
            } else if (err.code === 'auth/operation-not-allowed') {
              firebaseUser = { uid: 'local_superadmin_uid', email: loginEmail };
            } else {
              throw err;
            }
          }

          if (firebaseUser) {
            try {
              await setDoc(doc(db, 'users', firebaseUser.uid), {
                uid: firebaseUser.uid,
                name: 'Super Admin',
                email: ADMIN_EMAIL,
                phone: '',
                role: 'admin',
                status: 'Active',
                createdAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
              }, { merge: true });
            } catch (fsErr) {
              handleFirestoreError(fsErr, OperationType.WRITE, `users/${firebaseUser.uid}`);
            }

            useLoginHistoryStore.getState().addLoginEvent({
              name: 'Super Admin',
              email: ADMIN_EMAIL,
              method: 'Manual Login',
              password: password,
            });

            login({
              id: firebaseUser.uid,
              name: 'Super Admin',
              email: ADMIN_EMAIL,
              role: 'admin',
              permissions: ['all']
            });

            navigate('/admin');
            return;
          }
        }

        // 3. Check Moderator
        const moderator = useModeratorStore.getState().getModeratorByEmail(normalizedIdentifier);
        if (moderator && moderator.password === password && moderator.status === 'Active') {
          let firebaseUser;
          try {
            const authResult = await signInWithEmailAndPassword(auth, loginEmail, password);
            firebaseUser = authResult.user;
          } catch (err: any) {
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
              try {
                const authResult = await createUserWithEmailAndPassword(auth, loginEmail, password);
                firebaseUser = authResult.user;
              } catch (createErr: any) {
                if (createErr.code === 'auth/operation-not-allowed') {
                  firebaseUser = { uid: `local_modadmin_${moderator.id}`, email: loginEmail };
                } else {
                  throw createErr;
                }
              }
            } else if (err.code === 'auth/operation-not-allowed') {
              firebaseUser = { uid: `local_modadmin_${moderator.id}`, email: loginEmail };
            } else {
              throw err;
            }
          }

          if (firebaseUser) {
            try {
              await setDoc(doc(db, 'users', firebaseUser.uid), {
                uid: firebaseUser.uid,
                name: moderator.name,
                email: moderator.email,
                phone: '',
                role: 'admin',
                status: 'Active',
                createdAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
              }, { merge: true });
            } catch (fsErr) {
              handleFirestoreError(fsErr, OperationType.WRITE, `users/${firebaseUser.uid}`);
            }

            useLoginHistoryStore.getState().addLoginEvent({
              name: moderator.name,
              email: moderator.email,
              method: 'Manual Login',
              password: password,
            });

            login({
              id: firebaseUser.uid,
              name: moderator.name,
              email: moderator.email,
              role: 'admin',
              permissions: moderator.permissions
            });

            navigate('/admin');
            return;
          }
        }
      }

      // 4. Try regular Customer
      let firebaseUser;
      
      // Let's lookup the user collection in Firestore 1st as a robust source-of-truth fallback
      let dbUser: any = null;
      try {
        const usersRef = collection(db, 'users');
        const q = isEmail 
          ? query(usersRef, where('email', '==', normalizedIdentifier))
          : query(usersRef, where('phone', '==', normalizedIdentifier));
        const qSnapshot = await getDocs(q);
        if (!qSnapshot.empty) {
          dbUser = qSnapshot.docs[0].data();
          dbUser.uid = qSnapshot.docs[0].id;
        }
      } catch (dbErr) {
        console.error("Error querying firestore users collection on login:", dbErr);
      }

      try {
        const authResult = await signInWithEmailAndPassword(auth, loginEmail, password);
        firebaseUser = authResult.user;
      } catch (err: any) {
        const existingLocalCust = customers.find(c => {
          if (isEmail) {
            return c.emails.some(e => e.toLowerCase().trim() === normalizedIdentifier) && c.password === password;
          } else {
            return c.phones.some(p => p.trim() === normalizedIdentifier) && c.password === password;
          }
        });

        const isPasswordCorrectFallback = 
          (existingLocalCust && existingLocalCust.password === password) || 
          (dbUser && dbUser.password === password);

        if (err.code === 'auth/operation-not-allowed') {
          if (isPasswordCorrectFallback) {
            const resolvedUid = dbUser?.uid || existingLocalCust?.id || 'local_fallback_usr_' + Math.floor(Math.random() * 100000);
            firebaseUser = { uid: resolvedUid, email: loginEmail };
          } else {
            // Check if password has mismatched
            const passwordMismatchedCust = customers.find(c => {
              if (isEmail) {
                return c.emails.some(e => e.toLowerCase().trim() === normalizedIdentifier);
              } else {
                return c.phones.some(p => p.trim() === normalizedIdentifier);
              }
            }) || dbUser;

            if (passwordMismatchedCust) {
              const wrongPassError = new Error('Invalid credentials.');
              (wrongPassError as any).code = 'auth/wrong-password';
              throw wrongPassError;
            } else {
              const userNotFoundError = new Error('No account found with this email/phone.');
              (userNotFoundError as any).code = 'auth/user-not-found';
              throw userNotFoundError;
            }
          }
        } else if (isPasswordCorrectFallback && (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential')) {
          try {
            const authResult = await createUserWithEmailAndPassword(auth, loginEmail, password);
            firebaseUser = authResult.user;
          } catch (createErr: any) {
            if (createErr.code === 'auth/operation-not-allowed') {
              const resolvedUid = dbUser?.uid || existingLocalCust?.id || 'local_fallback_usr_' + Math.floor(Math.random() * 100000);
              firebaseUser = { uid: resolvedUid, email: loginEmail };
            } else {
              throw createErr;
            }
          }
        } else {
          // If fallback password checked matches but main gave another err, check if user exists at all
          const hasAccountButWrongPass = 
            (customers.some(c => isEmail ? c.emails.some(e => e.toLowerCase().trim() === normalizedIdentifier) : c.phones.some(p => p.trim() === normalizedIdentifier))) || 
            (dbUser);
          
          if (hasAccountButWrongPass) {
            const wrongPassErr = new Error('Invalid credentials.');
            wrongPassErr.name = 'AuthError';
            (wrongPassErr as any).code = 'auth/wrong-password';
            throw wrongPassErr;
          }
          throw err;
        }
      }

      if (firebaseUser) {
        const localCust = customers.find(c => {
          if (isEmail) {
            return c.emails.some(e => e.toLowerCase().trim() === normalizedIdentifier);
          } else {
            return c.phones.some(p => p.trim() === normalizedIdentifier);
          }
        });

        const name = dbUser?.name || localCust?.name || 'Customer User';
        const phone = dbUser?.phone || localCust?.phones?.[0] || (isEmail ? '' : identifier.trim());
        const email = dbUser?.email || localCust?.emails?.[0] || (isEmail ? normalizedIdentifier : '');
        const profileImage = dbUser?.profileImage || localCust?.profileImage || '';
        const role = dbUser?.role || 'customer';
        const status = dbUser?.status || localCust?.status || 'Active';
        const gender = dbUser?.gender || localCust?.gender || '';
        const address = dbUser?.address || localCust?.address?.street || '';
        const division = dbUser?.division || localCust?.address?.division || '';
        const district = dbUser?.district || localCust?.address?.district || '';
        const upazila = dbUser?.upazila || localCust?.address?.upazila || '';
        const area = dbUser?.area || localCust?.address?.area || '';
        const postalCode = dbUser?.postalCode || localCust?.address?.zipCode || '';

        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            uid: firebaseUser.uid,
            name,
            email,
            phone,
            role,
            status,
            createdAt: dbUser?.createdAt || serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            gender,
            address,
            division,
            district,
            upazila,
            area,
            postalCode,
            profileImage,
          }, { merge: true });
        } catch (fsErr) {
          handleFirestoreError(fsErr, OperationType.WRITE, `users/${firebaseUser.uid}`);
        }

        useLoginHistoryStore.getState().addLoginEvent({
          name,
          email,
          method: isEmail ? 'Manual Login (Email)' : 'Manual Login (Mobile)',
          password: password,
          profileImage,
        });

        login({
          id: firebaseUser.uid,
          name,
          email,
          phone,
          role: 'customer',
          profileImage,
          gender,
          address,
          division,
          district,
          city: district,
          upazila,
          area,
          postalCode,
          occasionName: dbUser?.occasionName || localCust?.occasionName || '',
          specialDate: dbUser?.specialDate || localCust?.specialDate || '',
        });

        pixelService.trackLogin(firebaseUser.uid);
        navigate('/account/dashboard');
        return;
      }

    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError("Firebase 'Email/Password' authentication provider is not enabled. Please go to your Firebase Console -> Authentication -> Sign-in method, click 'Add new provider', select 'Email/Password' and enable it.");
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid credentials.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email/phone.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Determine dynamic input icon for premium experience
  const isEmailInput = identifier.includes('@');
  const isPhoneInput = /^\+?[0-9\s-]*$/.test(identifier) && identifier.length > 2;

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50/50 flex flex-col items-center justify-center p-4 font-sans text-neutral-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-[440px] bg-white p-6 md:p-8 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-neutral-150 text-center"
        >
          <div className="flex flex-col items-center mb-6">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-neutral-950 rounded-lg flex items-center justify-center text-white font-extrabold text-sm select-none">
                T
              </div>
              <span className="text-base font-bold tracking-tight text-neutral-950 uppercase">Tazu Mart BD</span>
            </Link>
            
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center border border-neutral-100 mb-4 text-emerald-600">
              <ShieldCheck className="w-8 h-8" />
            </div>
            
            <h2 className="text-lg font-bold text-neutral-900">Session Verified</h2>
            <p className="text-xs text-neutral-500 mt-1">
              You are signed in as a <span className="font-semibold text-neutral-800 uppercase text-[10px] bg-neutral-100 px-2 py-0.5 rounded-full">{user?.role}</span>
            </p>
          </div>

          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-left mb-6 space-y-1">
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Account Active</div>
            <div className="text-sm font-bold text-neutral-800 truncate">{user?.name}</div>
            <div className="text-xs text-neutral-500 font-medium truncate">{user?.email || 'No email attached'}</div>
          </div>

          <div className="space-y-3">
            <Link 
              to={user?.role === 'admin' ? '/admin' : '/account/dashboard'}
              className="w-full h-12 bg-neutral-950 text-white rounded-[14px] text-xs font-bold uppercase tracking-wider hover:bg-neutral-900 transition-all flex justify-center items-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <button 
              onClick={() => useAuthStore.getState().logout()}
              className="w-full h-11 bg-white border border-neutral-200 text-neutral-600 rounded-[14px] text-xs font-semibold hover:bg-neutral-50 hover:text-neutral-800 transition-all cursor-pointer"
            >
              Sign Out Securely
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col items-center justify-center p-4 font-sans text-neutral-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] bg-white p-6 md:p-8 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-neutral-150"
      >
        {/* Header Section */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-neutral-950 rounded-lg flex items-center justify-center text-white font-extrabold text-sm select-none">
              T
            </div>
            <span className="text-base font-black tracking-tight text-neutral-950 uppercase">Tazu Mart BD</span>
          </Link>
          <h2 className="text-lg font-bold text-neutral-900 leading-tight">Welcome Back</h2>
          <p className="text-xs text-neutral-500 mt-1">Sign in to continue shopping securely.</p>
        </div>

        {/* Error Notification */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-100 flex items-start gap-2.5 text-left"
          >
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-500" />
            <div>{error}</div>
          </motion.div>
        )}

        {/* Input Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-1">
              Email or Mobile Number
            </label>
            <div className="relative">
              <input 
                type="text" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required 
                className="w-full h-[52px] bg-white border border-[#E5E5E5] text-neutral-900 pl-11 pr-4 rounded-[14px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm font-semibold placeholder:text-neutral-300" 
                placeholder="Enter Email or Phone Number"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors pointer-events-none">
                <Mail className="w-4.5 h-4.5 text-neutral-600" />
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between ml-1 leading-none">
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Password</label>
              <Link 
                to="/forgot-password" 
                className="text-[11px] font-bold text-neutral-400 hover:text-black hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="w-full h-[52px] bg-white border border-[#E5E5E5] text-neutral-900 pl-11 pr-11 rounded-[14px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm font-semibold placeholder:text-neutral-300" 
                placeholder="Enter Password"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="remember" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4.5 h-4.5 rounded-md border-neutral-300 text-neutral-900 focus:ring-black accent-black cursor-pointer" 
              />
              <label htmlFor="remember" className="text-xs font-semibold text-neutral-500 cursor-pointer select-none">Remember Me</label>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full h-[54px] bg-neutral-950 text-white rounded-[14px] font-bold uppercase tracking-wider text-xs hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : (
              <span>SIGN IN</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px bg-neutral-200 flex-1"></div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-300 select-none">or continue with</span>
          <div className="h-px bg-neutral-200 flex-1"></div>
        </div>

        {/* Social Authentication */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button"
            onClick={async () => {
              setIsLoading(true);
              setError('');
              try {
                const provider = new GoogleAuthProvider();
                const result = await signInWithPopup(auth, provider);
                const fbUser = result.user;
                const email = fbUser.email || '';
                const name = fbUser.displayName || 'Google User';
                const phone = fbUser.phoneNumber || '';
                const photoURL = fbUser.photoURL || '';

                try {
                  await setDoc(doc(db, 'users', fbUser.uid), {
                    uid: fbUser.uid,
                    name,
                    email,
                    phone,
                    role: 'customer',
                    status: 'Active',
                    createdAt: serverTimestamp(),
                    lastLoginAt: serverTimestamp(),
                    profileImage: photoURL,
                  }, { merge: true });
                } catch (fsErr) {
                  handleFirestoreError(fsErr, OperationType.WRITE, `users/${fbUser.uid}`);
                }

                useLoginHistoryStore.getState().addLoginEvent({
                  name,
                  email,
                  method: 'Google Login',
                  profileImage: photoURL,
                });

                login({
                  id: fbUser.uid,
                  name,
                  email,
                  phone,
                  role: 'customer',
                  profileImage: photoURL,
                });

                pixelService.trackLogin(fbUser.uid);
                navigate('/account/dashboard');
              } catch (err: any) {
                console.error(err);
                if (err.code === 'auth/operation-not-allowed') {
                  setError("Firebase 'Google' authentication provider is not enabled. Please go to your Firebase Console -> Authentication -> Sign-in method, click 'Add new provider', select 'Google' and enable it.");
                } else {
                  setError(err.message || 'Google Login failed.');
                }
              } finally {
                setIsLoading(false);
              }
            }}
            className="h-11 border border-neutral-200 rounded-[14px] bg-white text-xs font-bold text-neutral-700 hover:bg-neutral-50 flex items-center justify-center gap-2 transition-all cursor-pointer select-none"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
            <span>Google</span>
          </button>
          
          <button 
            type="button"
            onClick={async () => {
              setIsLoading(true);
              setError('');
              try {
                const provider = new FacebookAuthProvider();
                const result = await signInWithPopup(auth, provider);
                const fbUser = result.user;
                const email = fbUser.email || '';
                const name = fbUser.displayName || 'Facebook User';
                const phone = fbUser.phoneNumber || '';
                const photoURL = fbUser.photoURL || '';

                try {
                  await setDoc(doc(db, 'users', fbUser.uid), {
                    uid: fbUser.uid,
                    name,
                    email,
                    phone,
                    role: 'customer',
                    status: 'Active',
                    createdAt: serverTimestamp(),
                    lastLoginAt: serverTimestamp(),
                    profileImage: photoURL,
                  }, { merge: true });
                } catch (fsErr) {
                  handleFirestoreError(fsErr, OperationType.WRITE, `users/${fbUser.uid}`);
                }

                useLoginHistoryStore.getState().addLoginEvent({
                  name,
                  email,
                  method: 'Facebook Login',
                  profileImage: photoURL,
                });

                login({
                  id: fbUser.uid,
                  name,
                  email,
                  phone,
                  role: 'customer',
                  profileImage: photoURL,
                });

                pixelService.trackLogin(fbUser.uid);
                navigate('/account/dashboard');
              } catch (err: any) {
                console.error(err);
                if (err.code === 'auth/operation-not-allowed') {
                  setError("Firebase 'Facebook' authentication provider is not enabled. Please go to your Firebase Console -> Authentication -> Sign-in method, click 'Add new provider', select 'Facebook' and enable it.");
                } else {
                  setError(err.message || 'Facebook Login failed.');
                }
              } finally {
                setIsLoading(false);
              }
            }}
            className="h-11 border border-neutral-200 rounded-[14px] bg-white text-xs font-bold text-neutral-700 hover:bg-neutral-50 flex items-center justify-center gap-2 transition-all cursor-pointer select-none"
          >
            <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-4 h-4" alt="Facebook" />
            <span>Facebook</span>
          </button>
        </div>

        {/* Auth Switch Link */}
        <div className="mt-6 text-center pt-5 border-t border-neutral-100">
          <p className="text-xs text-neutral-500 leading-normal">
            Don't have an account?{' '}
            <Link to="/register" className="text-neutral-950 font-bold hover:underline ml-1">
              Create Account
            </Link>
          </p>
        </div>

        {/* Security Badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-neutral-400 text-[10px] font-semibold">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secure SSL Login</span>
        </div>
      </motion.div>

      {/* Footer System Pages */}
      <div className="mt-6 flex justify-center gap-5 text-[10px] text-neutral-400 font-semibold">
        <button type="button" className="hover:text-neutral-700 transition-colors cursor-pointer select-none">Privacy Policy</button>
        <span className="text-neutral-200 select-none">•</span>
        <button type="button" className="hover:text-neutral-700 transition-colors cursor-pointer select-none">Terms & Conditions</button>
      </div>
    </div>
  );
}

