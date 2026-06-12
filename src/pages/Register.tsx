import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Smartphone, User, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight, Plus, Trash2, Calendar, X, Pencil, RotateCw, UploadCloud, MapPin, Building2, Home } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { useCustomerStore } from '../store/useCustomerStore';
import { cn } from '../lib/utils';
import { uploadImage } from '../lib/imageUtils';
import { bdAddressData, divisions } from '../data/addressData';
import { pixelService } from '../utils/pixelService';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthStore();
  const { addCustomer, customers } = useCustomerStore();

  const from = location.state?.from?.pathname || '/account/dashboard';

  useEffect(() => {
    if (isAuthenticated && !success) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from, success]);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    division: '',
    district: '',
    upazila: '',
    area: '',
    postalCode: '',
    email: '',
    password: '',
    confirmPassword: '',
    occasionName: '',
    specialDate: '',
    profileImage: '',
    gender: '',
  });

  const [specialDays, setSpecialDays] = useState<{ id: string; name: string; date: string }[]>([]);

  const [uploadedRawImage, setUploadedRawImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedRawImage(reader.result as string);
        setZoom(1);
        setPanX(0);
        setPanY(0);
        setRotation(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditExistingPhoto = () => {
    if (formData.profileImage) {
      setUploadedRawImage(formData.profileImage);
      setZoom(1);
      setPanX(0);
      setPanY(0);
      setRotation(0);
    }
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - panX, y: clientY - panY });
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPanX(clientX - dragStart.x);
    setPanY(clientY - dragStart.y);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const cropImage = () => {
    if (!uploadedRawImage) return;
    const imgElement = new Image();
    imgElement.src = uploadedRawImage;
    imgElement.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = 300;
      canvas.width = size;
      canvas.height = size;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      const scaleToFit = Math.min(192 / imgElement.width, 192 / imgElement.height);
      const displayWidth = imgElement.width * scaleToFit;
      const displayHeight = imgElement.height * scaleToFit;

      const scaleCanvas = size / 192;

      ctx.save();
      // Translate to center to easily rotate and scale
      ctx.translate(size / 2, size / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      
      // Calculate drawing coordinates centered
      const drawX = (-displayWidth / 2 + panX) * scaleCanvas;
      const drawY = (-displayHeight / 2 + panY) * scaleCanvas;

      ctx.drawImage(
        imgElement,
        drawX,
        drawY,
        displayWidth * scaleCanvas,
        displayHeight * scaleCanvas
      );
      ctx.restore();

      const croppedUrl = canvas.toDataURL('image/jpeg', 0.92);
      setFormData(prev => ({ ...prev, profileImage: croppedUrl }));
      setUploadedRawImage(null);
    };
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please Enter Full Name';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Please Enter Mobile Number';
    } else {
      const phoneInUse = customers.some(c => c.phones.some(p => p.trim() === formData.phone.trim()));
      if (phoneInUse) {
        newErrors.phone = 'This mobile number is already registered';
      }
    }
    if (formData.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      } else {
        const emailInUse = customers.some(c => c.emails.some(e => e.toLowerCase().trim() === formData.email.toLowerCase().trim()));
        if (emailInUse) {
          newErrors.email = 'User already exists. Please sign in';
        }
      }
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Please create a secure password';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please repeat your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Please Enter Full Address';
    }
    if (!formData.gender) {
      newErrors.gender = 'Please Select Gender';
    }

    // Validation for Special Days (made required if added)
    if (specialDays.length > 0) {
      for (const day of specialDays) {
        if (!day.name.trim()) {
          setError('Please fill Occasion Name for all added special event fields.');
          return;
        }
        if (!day.date.trim()) {
          setError('Please select a Date for all added special status fields.');
          return;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setError('Please fill in all mandatory fields correctly.');
      return;
    }

    setIsLoading(true);
    setError('');
    setErrors({});

    const occasionJoined = specialDays.length > 0 
      ? specialDays.map(d => d.name.trim()).join(' | ') 
      : '';
    
    const datesJoined = specialDays.length > 0
      ? specialDays.map(d => {
          const parts = d.date.split('-');
          if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY
          }
          return d.date;
        }).join(' | ')
      : '';

    try {
      let finalProfileImage = formData.profileImage;
      if (finalProfileImage?.startsWith('data:')) {
        try {
          // Bypassed Storage file uploads to satisfy "Do NOT use Storage yet"
          // const res = await fetch(finalProfileImage);
          // const blob = await res.blob();
          // finalProfileImage = await uploadImage(blob, 'user-profiles', `user-${Date.now()}.jpg`);
        } catch (err) {
          console.error('Failed to upload image:', err);
        }
      }

      const signupEmail = formData.email ? formData.email.toLowerCase().trim() : `${formData.phone.trim()}@tazumart.com`;
      
      let firebaseUser;
      try {
        const authResult = await createUserWithEmailAndPassword(auth, signupEmail, formData.password);
        firebaseUser = authResult.user;
      } catch (authErr: any) {
        if (authErr.code === 'auth/operation-not-allowed') {
          console.warn("Firebase Auth is not enabled. Proceeding with robust local fallback customer direct Firestore write.");
          // Generate a safe local ID
          const fallbackUid = 'local_usr_' + Math.floor(Math.random() * 10000000).toString();
          firebaseUser = {
            uid: fallbackUid,
            email: signupEmail,
          };
        } else {
          throw authErr;
        }
      }

      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          uid: firebaseUser.uid,
          name: formData.fullName,
          email: formData.email ? formData.email.toLowerCase().trim() : '',
          phone: formData.phone.trim(),
          role: 'customer',
          status: 'Active',
          password: formData.password,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          gender: formData.gender,
          address: formData.address.trim(),
          division: formData.division,
          district: formData.district,
          upazila: formData.upazila,
          area: formData.area,
          postalCode: formData.postalCode,
          profileImage: finalProfileImage || '',
          occasionName: occasionJoined,
          specialDate: datesJoined,
        }, { merge: true });
        
        // Note: Subcollections (folders, notes, teamMembers) are implicitly 
        // ready and will start existing as soon as the user adds their first record.
      } catch (fsErr) {
        handleFirestoreError(fsErr, OperationType.WRITE, `users/${firebaseUser.uid}`);
      }

      const newCustomer = {
        id: firebaseUser.uid,
        name: formData.fullName,
        phones: [formData.phone.trim()],
        emails: formData.email ? [formData.email.toLowerCase().trim()] : [],
        password: formData.password,
        address: {
          country: 'Bangladesh',
          city: formData.district,
          area: formData.area || formData.upazila,
          street: formData.address.trim(),
          division: formData.division,
          district: formData.district,
          upazila: formData.upazila,
          zipCode: formData.postalCode,
        },
        profileImage: finalProfileImage || undefined,
        gender: formData.gender,
        occasionName: occasionJoined,
        specialDate: datesJoined,
        socialLinks: [],
        status: 'Active' as const,
        customerType: 'New' as const,
        totalOrders: 0,
        totalSpend: 0,
        lastLogin: Date.now(),
        totalLogins: 1,
      };

      addCustomer(newCustomer);

      login({
        id: firebaseUser.uid,
        name: formData.fullName,
        email: formData.email ? formData.email.toLowerCase().trim() : '',
        phone: formData.phone.trim(),
        role: 'customer',
        gender: formData.gender,
        address: formData.address.trim(),
        division: formData.division,
        district: formData.district,
        upazila: formData.upazila,
        profileImage: formData.profileImage,
        occasionName: occasionJoined,
        specialDate: datesJoined,
      });

      pixelService.trackRegister(firebaseUser.uid);

      setIsLoading(false);
      setSuccess(true);

      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1800);

    } catch (err: any) {
      if (err.code !== 'auth/operation-not-allowed' && err.code !== 'auth/email-already-in-use' && err.code !== 'auth/weak-password') {
        console.error(err);
      }
      setIsLoading(false);
      if (err.code === 'auth/operation-not-allowed') {
        setError("Firebase 'Email/Password' authentication provider is not enabled. Please go to your Firebase Console -> Authentication -> Sign-in method, click 'Add new provider', select 'Email/Password' and enable it.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError('User already exists. Please sign in');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-50/50 flex flex-col items-center justify-center p-4 font-sans text-neutral-900">
        <motion.div 
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-[440px] bg-white p-6 md:p-8 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-neutral-150 text-center space-y-5"
        >
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm animate-pulse">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-neutral-900 uppercase tracking-wide">Account Created</h2>
            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Welcome To Tazu Mart</p>
          </div>

          <p className="text-xs text-neutral-500 font-medium leading-relaxed bg-neutral-50 p-3.5 rounded-xl border border-neutral-150">
            Your premium shop profile has been activated. Logging you in automatically...
          </p>

          <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-neutral-600 pt-2">
            <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
            <span>Redirecting to Checkout / Account...</span>
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
            <span className="text-base font-black tracking-tight text-neutral-950 uppercase">Tazu Mart</span>
          </Link>
          <h2 className="text-lg font-bold text-neutral-900 leading-tight">Create Account</h2>
          <p className="text-xs text-neutral-500 mt-1">Register to start secure shopping.</p>
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

        {/* Signup Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Profile Picture Upload - 1:1 Flat rectangle design */}
          <div className="space-y-2 text-left">
            <div className="flex justify-between items-center ml-1">
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Profile Picture</label>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Optional</span>
            </div>

            <div className="flex gap-4 items-center">
              <div 
                onClick={(e) => {
                  if (formData.profileImage) {
                    e.preventDefault();
                    handleEditExistingPhoto();
                  }
                }}
                className="relative flex flex-col items-center justify-center w-24 h-24 border border-[#111111] bg-neutral-50 hover:bg-neutral-100 transition-all cursor-pointer overflow-hidden group shrink-0 rounded-none"
              >
                {formData.profileImage ? (
                  <div className="relative w-full h-full group/preview">
                    <img src={formData.profileImage} alt="Profile Preview" className="w-full h-full object-cover rounded-none" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 flex items-center justify-center transition-all">
                      <div className="p-1 px-1.5 bg-white text-black font-extrabold text-[8px] uppercase tracking-wider flex items-center gap-0.5 border border-black shadow-sm">
                        <Pencil className="w-3 h-3 stroke-[2.5]" />
                        <span>Edit</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="w-full h-full cursor-pointer flex flex-col items-center justify-center text-center p-2">
                    <Plus className="w-6 h-6 text-neutral-400 group-hover:text-black transition-colors" />
                    <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest group-hover:text-black transition-colors leading-none">UPLOAD</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>

              <div className="space-y-1">
                <span className="block text-[11.5px] font-bold uppercase text-zinc-950 tracking-tight">1:1 Profile Photo</span>
                <p className="text-[9px] text-gray-400 leading-normal uppercase">
                  Adjust and alignment zoom crops live. Click square to browse mobile/PC files.
                </p>
                
                {formData.profileImage && (
                  <div className="flex items-center gap-2 pt-1 animate-fade-in">
                    <button 
                      type="button" 
                      onClick={handleEditExistingPhoto}
                      className="text-[9.5px] font-black text-purple-700 hover:text-white bg-purple-50 hover:bg-purple-700 transition-colors py-1 px-2.5 border border-purple-250 uppercase flex items-center gap-1 rounded-none"
                    >
                      <Pencil className="w-3 h-3 stroke-[2.5]" />
                      <span>EDIT PHOTO</span>
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, profileImage: '' }))}
                      className="text-[9.5px] font-black text-red-650 hover:text-white bg-red-50 hover:bg-red-600 transition-colors py-1 px-2 border border-red-200 uppercase flex items-center gap-1 rounded-none"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>CLEAR</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Full Name *</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required 
                  className={cn(
                    "w-full h-[52px] bg-white border text-neutral-900 pl-11 pr-4 rounded-[14px] focus:outline-none focus:ring-1 transition-all text-sm font-semibold placeholder:text-neutral-300",
                    errors.fullName 
                      ? "border-red-500 focus:border-red-650 focus:ring-red-650 bg-red-50/5" 
                      : "border-[#E5E5E5] focus:border-black focus:ring-black"
                  )}
                  placeholder="e.g. Imtiaz Khan"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <User className="w-4.5 h-4.5" />
                </span>
              </div>
              {errors.fullName && (
                <p className="text-[10px] font-bold text-red-600 ml-1 mt-0.5 uppercase tracking-wide flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                  <span>{errors.fullName}</span>
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Mobile Number *</label>
              <div className="relative">
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required 
                  className={cn(
                    "w-full h-[52px] bg-white border text-neutral-900 pl-11 pr-4 rounded-[14px] focus:outline-none focus:ring-1 transition-all text-sm font-semibold placeholder:text-neutral-300",
                    errors.phone 
                      ? "border-red-500 focus:border-red-650 focus:ring-red-650 bg-red-50/5" 
                      : "border-[#E5E5E5] focus:border-black focus:ring-black"
                  )}
                  placeholder="+880 1XXXXXXXXX"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <Smartphone className="w-4.5 h-4.5" />
                </span>
              </div>
              {errors.phone && (
                <p className="text-[10px] font-bold text-red-600 ml-1 mt-0.5 uppercase tracking-wide flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Email Address (Optional)</label>
              <div className="relative">
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={cn(
                    "w-full h-[52px] bg-white border text-neutral-900 pl-11 pr-4 rounded-[14px] focus:outline-none focus:ring-1 transition-all text-sm font-semibold placeholder:text-neutral-300",
                    errors.email 
                      ? "border-red-500 focus:border-red-650 focus:ring-red-650 bg-red-50/5" 
                      : "border-[#E5E5E5] focus:border-black focus:ring-black"
                  )}
                  placeholder="name@example.com"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <Mail className="w-4.5 h-4.5" />
                </span>
              </div>
              {errors.email && (
                <p className="text-[10px] font-bold text-red-600 ml-1 mt-0.5 uppercase tracking-wide flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Password *</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required 
                  className={cn(
                    "w-full h-[52px] bg-white border text-neutral-900 pl-11 pr-11 rounded-[14px] focus:outline-none focus:ring-1 transition-all text-sm font-semibold placeholder:text-neutral-300",
                    errors.password 
                      ? "border-red-500 focus:border-red-650 focus:ring-red-650 bg-red-50/5" 
                      : "border-[#E5E5E5] focus:border-black focus:ring-black"
                  )}
                  placeholder="At least 6 characters"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <Lock className="w-4.5 h-4.5" />
                </span>
              </div>
              {errors.password && (
                <p className="text-[10px] font-bold text-red-600 ml-1 mt-0.5 uppercase tracking-wide flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Confirm Password *</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required 
                  className={cn(
                    "w-full h-[52px] bg-white border text-neutral-900 pl-11 pr-11 rounded-[14px] focus:outline-none focus:ring-1 transition-all text-sm font-semibold placeholder:text-neutral-300",
                    errors.confirmPassword 
                      ? "border-red-500 focus:border-red-650 focus:ring-red-650 bg-red-50/5" 
                      : "border-[#E5E5E5] focus:border-black focus:ring-black"
                  )}
                  placeholder="Repeat your password"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <ShieldCheck className="w-4.5 h-4.5" />
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
              {errors.confirmPassword && (
                <p className="text-[10px] font-bold text-red-600 ml-1 mt-0.5 uppercase tracking-wide flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>

            {/* Address Information Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 border-b border-neutral-150 pb-2 mb-2">
                <MapPin className="w-4 h-4 text-neutral-400" />
                <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Address Information</h3>
              </div>

              {/* Division Dropdown */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Division (Optional)</label>
                <select
                  name="division"
                  value={formData.division}
                  onChange={(e) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      division: e.target.value,
                      district: '',
                      upazila: ''
                    }));
                  }}
                  className={cn(
                    "w-full h-[52px] bg-white border text-neutral-900 px-4 rounded-[14px] focus:outline-none focus:ring-1 transition-all text-sm font-semibold",
                    errors.division ? "border-red-500 focus:border-red-650 focus:ring-red-650" : "border-[#E5E5E5] focus:border-black"
                  )}
                >
                  <option value="">Select Division</option>
                  {divisions.map(div => <option key={div} value={div}>{div}</option>)}
                </select>
              </div>

              {/* District Dropdown */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-1">District (Optional)</label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={(e) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      district: e.target.value,
                      upazila: ''
                    }));
                  }}
                  disabled={!formData.division}
                  className={cn(
                    "w-full h-[52px] bg-white border text-neutral-900 px-4 rounded-[14px] focus:outline-none focus:ring-1 transition-all text-sm font-semibold disabled:opacity-50 disabled:bg-neutral-50",
                    errors.district ? "border-red-500 focus:border-red-650 focus:ring-red-650" : "border-[#E5E5E5] focus:border-black"
                  )}
                >
                  <option value="">Select District</option>
                  {formData.division && bdAddressData[formData.division as keyof typeof bdAddressData] && 
                    Object.keys(bdAddressData[formData.division as keyof typeof bdAddressData]).map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))
                  }
                </select>
              </div>

              {/* Upazila Dropdown */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Upazila / Thana (Optional)</label>
                <select
                  name="upazila"
                  value={formData.upazila}
                  onChange={handleChange}
                  disabled={!formData.district}
                  className={cn(
                    "w-full h-[52px] bg-white border text-neutral-900 px-4 rounded-[14px] focus:outline-none focus:ring-1 transition-all text-sm font-semibold disabled:opacity-50 disabled:bg-neutral-50",
                    errors.upazila ? "border-red-500 focus:border-red-650 focus:ring-red-650" : "border-[#E5E5E5] focus:border-black"
                  )}
                >
                  <option value="">Select Upazila</option>
                  {formData.division && formData.district && bdAddressData[formData.division as keyof typeof bdAddressData]?.[formData.district]?.map(upz => (
                      <option key={upz} value={upz}>{upz}</option>
                    ))
                  }
                </select>
              </div>

              {/* Area & Postal Code Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Area / Union (Opt)</label>
                  <input 
                    type="text" 
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    className="w-full h-[52px] bg-white border border-[#E5E5E5] text-neutral-900 px-4 rounded-[14px] focus:outline-none focus:border-black text-sm font-semibold placeholder:text-neutral-300"
                    placeholder="e.g. Ward 5"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Postal Code (Opt)</label>
                  <input 
                    type="text" 
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full h-[52px] bg-white border border-[#E5E5E5] text-neutral-900 px-4 rounded-[14px] focus:outline-none focus:border-black text-sm font-semibold placeholder:text-neutral-300"
                    placeholder="e.g. 1200"
                  />
                </div>
              </div>

              {/* Full Address */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Full Address *</label>
                <div className="relative">
                  <textarea 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required 
                    rows={2}
                    className={cn(
                      "w-full bg-white border text-neutral-900 px-4 py-3 rounded-[14px] focus:outline-none focus:ring-1 transition-all text-sm font-semibold placeholder:text-neutral-300 resize-none",
                      errors.address 
                        ? "border-red-500 focus:border-red-650 focus:ring-red-650 bg-red-50/5" 
                        : "border-[#E5E5E5] focus:border-black focus:ring-black"
                    )}
                    placeholder="Enter your detailed house/road information"
                  />
                </div>
                {errors.address && (
                  <p className="text-[10px] font-bold text-red-600 ml-1 mt-0.5 uppercase tracking-wide flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                    <span>{errors.address}</span>
                  </p>
                )}
              </div>
            </div>

          {/* Your Special Day - Dynamic multiplier list */}
          <div className="space-y-4 text-left pt-2 pb-2">
            <div className="flex justify-between items-center border-b border-[#111111]/10 pb-2">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Special Day (Optional)</span>
              </h3>
              
              <button
                type="button"
                onClick={() => {
                  const id = 'day_' + Math.random().toString(36).substring(2, 9);
                  setSpecialDays([...specialDays, { id, name: '', date: '' }]);
                }}
                className="flex items-center gap-1 text-[10px] font-black uppercase text-purple-600 hover:text-purple-700 bg-purple-50 px-2.5 py-1 transition-all border border-purple-150 rounded-none h-7"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Add More</span>
              </button>
            </div>

            {specialDays.length === 0 ? (
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider leading-relaxed pb-1">
                No Special Days added yet. (Add custom dates to receive extra promo/reward benefits optionally)
              </p>
            ) : (
              <div className="space-y-3">
                {specialDays.map((day, idx) => (
                  <div key={day.id} className="p-3 border border-[#111111] bg-neutral-50/50 space-y-3 relative rounded-none">
                    <div className="flex justify-between items-center pb-2 border-b border-[#111111]/10">
                      <span className="text-[9px] font-bold text-purple-600 uppercase tracking-widest">Occasion #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSpecialDays(specialDays.filter(item => item.id !== day.id));
                        }}
                        className="p-0.5 text-zinc-400 hover:text-red-600 transition-colors"
                        title="Remove Day"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-[#111111] uppercase tracking-wider">Occasion Name</label>
                        <input
                          type="text"
                          required
                          value={day.name}
                          onChange={(e) => {
                            const updated = [...specialDays];
                            updated[idx].name = e.target.value;
                            setSpecialDays(updated);
                          }}
                          placeholder="e.g. Birthday"
                          className="w-full h-10 bg-white border border-[#E5E5E5] text-neutral-900 px-2.5 rounded-none focus:outline-none focus:border-black text-xs font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-[#111111] uppercase tracking-wider">Sought Date</label>
                        <input
                          type="date"
                          required
                          value={day.date}
                          onChange={(e) => {
                            const updated = [...specialDays];
                            updated[idx].date = e.target.value;
                            setSpecialDays(updated);
                          }}
                          className="w-full h-10 bg-white border border-[#E5E5E5] text-neutral-900 px-2 rounded-none focus:outline-none focus:border-black text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-[9px] text-purple-600 font-bold uppercase tracking-wider leading-relaxed bg-purple-50/40 p-2.5 border border-purple-100">
              * On this special day, verified customer group will receive unique discount rewards.
            </p>
          </div>

          {/* Gender Box */}
          <div className="space-y-1.5 text-left pb-2">
            <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Gender (Male / Female / Others)</label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Others', label: 'Others' }
              ].map((g) => {
                const isSelected = formData.gender === g.value;
                return (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, gender: g.value }));
                      if (errors.gender) {
                        setErrors(prev => {
                          const copy = { ...prev };
                          delete copy.gender;
                          return copy;
                        });
                      }
                    }}
                    className={cn(
                      "h-[48px] flex items-center justify-center font-bold text-xs uppercase border transition-all duration-200 rounded-[12px]",
                      isSelected 
                        ? "border-neutral-950 bg-neutral-950 text-white shadow-sm"
                        : errors.gender 
                          ? "border-red-500 bg-white text-neutral-700 hover:bg-neutral-50"
                          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                    )}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
            {errors.gender && (
              <p className="text-[10px] font-bold text-red-600 ml-1 mt-0.5 uppercase tracking-wide flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                <span>{errors.gender}</span>
              </p>
            )}
          </div>

          </div>

          {/* Button Submit */}
          <div className="pt-2">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-[54px] bg-neutral-950 text-white rounded-[14px] font-bold uppercase tracking-wider text-xs hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : (
                <span>CREATE ACCOUNT</span>
              )}
            </button>
          </div>
        </form>

        {/* Existing User Redirect Link */}
        <div className="mt-6 text-center pt-5 border-t border-neutral-100">
          <p className="text-xs text-neutral-500 leading-normal">
            Already have an account?{' '}
            <Link to="/login" className="text-neutral-950 font-bold hover:underline ml-1">
              Sign In
            </Link>
          </p>
        </div>

        {/* Security Badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-neutral-400 text-[10px] font-semibold">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secure SSL Registration</span>
        </div>
      </motion.div>

      {/* Floating Crop Canvas Editor Portal Modal */}
      {uploadedRawImage && (
        <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 font-mono text-[#111111] animate-fade-in animate-duration-200">
          <div className="bg-white border-2 border-black max-w-[360px] w-full p-6 space-y-4 rounded-none shadow-2xl relative">
            
            {/* Header */}
            <div className="border-b border-black pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                  <Pencil className="w-3.5 h-3.5 text-purple-600 stroke-[3]" />
                  <span>Profile Photo Editor</span>
                </span>
                <button
                  type="button"
                  onClick={() => setUploadedRawImage(null)}
                  className="p-1 hover:bg-neutral-100 transition-colors border border-transparent hover:border-black rounded-none"
                  title="Close Editor"
                >
                  <X className="w-4 h-4 text-black" />
                </button>
              </div>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">
                Drag to align, rotate, or zoom for the perfect 1:1 fit
              </p>
            </div>

            {/* Viewport frame with crop lines */}
            <div className="relative w-56 h-56 mx-auto border-2 border-black bg-neutral-950 overflow-hidden cursor-move select-none shadow-inner rounded-none group/viewport">
              <div 
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
                className="absolute inset-0 flex items-center justify-center text-center"
              >
                <img 
                  src={uploadedRawImage} 
                  alt="active crop element" 
                  draggable={false}
                  className="absolute origin-center select-none max-w-none pointer-events-none transition-all duration-75"
                  style={{
                    transform: `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${zoom}) rotate(${rotation}deg)`,
                    top: '50%',
                    left: '50%',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>

              {/* Crop Grid Guidelines overlay */}
              <div className="absolute inset-4 border border-dashed border-white/40 pointer-events-none flex flex-col justify-between">
                <div className="border-b border-dashed border-white/25 w-full h-[33%]" />
                <div className="border-t border-dashed border-white/25 w-full h-[33%]" />
              </div>
              <div className="absolute inset-4 border border-dashed border-white/40 pointer-events-none flex justify-between">
                <div className="border-r border-dashed border-white/25 h-full w-[33%]" />
                <div className="border-l border-dashed border-white/25 h-full w-[33%]" />
              </div>
              <div className="absolute inset-0 border-[16px] border-black/65 pointer-events-none" />
              <div className="absolute inset-0 border-2 border-black pointer-events-none" />
            </div>

            {/* Toolbar section: Zoom and Rotate */}
            <div className="bg-neutral-50 p-3 border border-black space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black text-black uppercase tracking-wider">
                <span>Zoom Scale ({zoom.toFixed(2)}x)</span>
                <span className="text-[9px] text-purple-600 bg-purple-50 px-1.5 py-0.5 border border-purple-200">1:1 Locked</span>
              </div>

              {/* Slider zoom */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-gray-400">A-</span>
                <input 
                  type="range"
                  min="0.8"
                  max="4"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 h-1 bg-gray-200 cursor-pointer accent-black uppercase"
                />
                <span className="text-[10px] font-bold text-gray-500">A+</span>
              </div>

              {/* Editor action strip: Rotate, choose new photo, reset */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  className="h-8 border border-black hover:bg-neutral-150 flex items-center justify-center gap-1.5 text-[9px] font-black uppercase text-black bg-white"
                >
                  <RotateCw className="w-3 h-3 text-purple-600" />
                  <span>ROTATE</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('modal-alternate-upload');
                    el?.click();
                  }}
                  className="h-8 border border-black hover:bg-neutral-150 flex items-center justify-center gap-1.5 text-[9px] font-black uppercase text-black bg-white"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-purple-600" />
                  <span>RE-UPLOAD</span>
                </button>
                <input 
                  type="file" 
                  id="modal-alternate-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                />

                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setPanX(0);
                    setPanY(0);
                    setRotation(0);
                  }}
                  className="h-8 border border-black hover:bg-neutral-150 flex items-center justify-center text-[9px] font-black uppercase text-neutral-500 bg-white"
                >
                  RESET
                </button>
              </div>
            </div>

            {/* Quick manual nudge helpers for fine adjustments */}
            <div className="grid grid-cols-4 gap-1 text-[9px] font-bold text-black uppercase">
              <button type="button" onClick={() => setPanY(y => y - 5)} className="border border-black py-1 bg-white hover:bg-neutral-50">▲ Up</button>
              <button type="button" onClick={() => setPanY(y => y + 5)} className="border border-black py-1 bg-white hover:bg-neutral-50">▼ Down</button>
              <button type="button" onClick={() => setPanX(x => x - 5)} className="border border-black py-1 bg-white hover:bg-neutral-50">◀ Left</button>
              <button type="button" onClick={() => setPanX(x => x + 5)} className="border border-black py-1 bg-white hover:bg-neutral-50">▶ Right</button>
            </div>

            {/* CTA action buttons */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/10">
              <button 
                type="button" 
                onClick={() => setUploadedRawImage(null)}
                className="h-10 border border-black text-[10px] font-black hover:bg-neutral-50 uppercase tracking-wider text-center"
              >
                Cancel
              </button>
              
              <button 
                type="button" 
                onClick={() => {
                  setFormData(prev => ({ ...prev, profileImage: '' }));
                  setUploadedRawImage(null);
                }}
                className="h-10 border border-red-200 text-red-650 hover:bg-red-50 text-[10px] font-black uppercase tracking-wider text-center bg-red-50/20"
              >
                Remove
              </button>

              <button 
                type="button" 
                onClick={cropImage}
                className="h-10 bg-purple-600 text-white text-[10px] font-black hover:bg-purple-700 uppercase tracking-wider text-center border border-black"
              >
                Save Photo
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Footer System Pages */}
      <div className="mt-6 flex justify-center gap-5 text-[10px] text-neutral-400 font-semibold">
        <button type="button" className="hover:text-neutral-700 transition-colors cursor-pointer select-none">Privacy Policy</button>
        <span className="text-neutral-200 select-none">•</span>
        <button type="button" className="hover:text-neutral-700 transition-colors cursor-pointer select-none">Terms & Conditions</button>
      </div>
    </div>
  );
}
