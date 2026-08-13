import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useBrandingStore } from '../store/useBrandingStore';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { settings: branding } = useBrandingStore();
  
  const [status, setStatus] = useState<'verifying' | 'exchanging' | 'syncing' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      try {
        const supabase = getSupabase();
        if (!supabase) {
          throw new Error('Database client not initialized');
        }

        // 1. Check if error is present in query string or hash
        const errorParam = searchParams.get('error') || new URLSearchParams(window.location.hash.substring(1)).get('error');
        const errorDesc = searchParams.get('error_description') || new URLSearchParams(window.location.hash.substring(1)).get('error_description');

        if (errorParam || errorDesc) {
          console.error('[OAuth Callback] Error returned from provider:', errorParam, errorDesc);
          if (isMounted) {
            setErrorMessage(errorDesc || errorParam || 'Authentication failed or was cancelled by user.');
            setStatus('error');
          }
          return;
        }

        // 2. Extract PKCE authorization code
        const code = searchParams.get('code');
        
        if (code) {
          if (isMounted) setStatus('exchanging');
          
          // Explicitly exchange authorization code for session (PKCE flow)
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.warn('[OAuth Callback] PKCE code exchange warning:', exchangeError.message);
          }
        }

        // 3. Verify session establishment
        if (isMounted) setStatus('syncing');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          console.error('[OAuth Callback] Session error or missing user:', sessionError);
          if (isMounted) {
            setErrorMessage(sessionError?.message || 'Failed to establish active user session. Please try again.');
            setStatus('error');
          }
          return;
        }

        // 4. Extract profile & identity metadata
        const user = session.user;
        const meta = user.user_metadata || {};
        const identities = user.identities || [];
        const googleIdentity = identities.find((i: any) => i.provider === 'google');
        const facebookIdentity = identities.find((i: any) => i.provider === 'facebook');
        
        const isGoogle = !!googleIdentity || user.app_metadata?.provider === 'google' || user.app_metadata?.providers?.includes('google') || (meta.iss && meta.iss.includes('google'));
        const isFacebook = !!facebookIdentity || user.app_metadata?.provider === 'facebook' || user.app_metadata?.providers?.includes('facebook') || (meta.iss && meta.iss.includes('facebook'));
        const loginProvider = isGoogle ? 'Google' : (isFacebook ? 'Facebook' : 'Email');
        
        const name = meta.full_name || meta.name || meta.fullName || user.email?.split('@')[0] || (isFacebook ? 'Facebook Customer' : 'Customer');
        const email = user.email || meta.email || '';
        const phone = meta.phone || user.phone || '';
        const profileImage = meta.avatar_url || meta.picture || meta.profileImage || meta.avatar || '';
        const googleId = googleIdentity?.id || (isGoogle ? (meta.sub || user.id) : undefined);
        const facebookId = facebookIdentity?.id || (isFacebook ? (meta.sub || user.id) : undefined);

        // Check if user record exists in database
        const { data: dbUserProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        const userData = {
          id: user.id,
          name: dbUserProfile?.name || name,
          email: user.email || dbUserProfile?.email || email,
          role: (dbUserProfile?.role || 'customer') as any,
          phone: dbUserProfile?.phone || phone,
          profileImage: dbUserProfile?.profileImage || dbUserProfile?.profile_image || profileImage,
          gender: dbUserProfile?.gender || meta.gender || '',
          address: dbUserProfile?.address || meta.address || '',
          division: dbUserProfile?.division || meta.division || '',
          district: dbUserProfile?.district || meta.district || '',
          upazila: dbUserProfile?.upazila || meta.upazila || '',
          area: dbUserProfile?.area || meta.area || '',
          postalCode: dbUserProfile?.postalCode || meta.postalCode || meta.zipCode || '',
        };

        // 5. Sync or Create in public.users table
        const userProfileData = {
          id: user.id,
          uid: user.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
          status: 'Active',
          createdAt: dbUserProfile?.createdAt || dbUserProfile?.created_at || user.created_at || new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          gender: userData.gender,
          address: userData.address,
          division: userData.division,
          district: userData.district,
          upazila: userData.upazila,
          area: userData.area,
          postalCode: userData.postalCode,
          profileImage: userData.profileImage,
          profile_image: userData.profileImage,
          loginProvider: loginProvider,
          login_provider: loginProvider,
          google_id: googleId,
          facebook_id: facebookId
        };

        await supabase.from('users').upsert([userProfileData]);

        // 6. Sync in public.customers table if customer role
        if (userData.role === 'customer') {
          const customerData = {
            id: user.id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            address: {
              street: userData.address,
              division: userData.division,
              district: userData.district,
              upazila: userData.upazila,
              zipCode: userData.postalCode
            },
            profile_image: userData.profileImage,
            gender: userData.gender,
            status: 'Active',
            customer_type: 'Regular',
            login_provider: loginProvider,
            google_id: googleId,
            facebook_id: facebookId,
            created_at: dbUserProfile?.created_at || user.created_at || new Date().toISOString(),
            last_login_at: new Date().toISOString()
          };

          await supabase.from('customers').upsert([customerData]);
        }

        // 7. Update Zustand state
        useAuthStore.getState().login(userData);

        if (isMounted) setStatus('success');

        // 8. Redirect to intended destination or account dashboard
        const nextTarget = searchParams.get('next') || (userData.role === 'admin' || userData.role === 'moderator' ? '/admin' : '/account/dashboard');
        
        setTimeout(() => {
          if (isMounted) {
            navigate(nextTarget, { replace: true });
          }
        }, 500);

      } catch (err: any) {
        console.error('[OAuth Callback] Processing failure:', err);
        if (isMounted) {
          setErrorMessage(err.message || 'An unexpected error occurred while verifying session.');
          setStatus('error');
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [searchParams, navigate]);

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center p-4 bg-[#F8F9FA]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#EAECEF] p-8 text-center space-y-6">
        {/* Header Icon */}
        <div className="flex justify-center">
          {status === 'error' ? (
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
              <AlertCircle className="w-8 h-8" />
            </div>
          ) : status === 'success' ? (
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-[#F4EEFF] text-[#6C3BFF] flex items-center justify-center shadow-xs">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          )}
        </div>

        {/* Dynamic Titles & Status Messages */}
        <div className="space-y-2">
          {status === 'error' ? (
            <>
              <h2 className="text-xl font-black text-neutral-900 tracking-tight">Authentication Failed</h2>
              <p className="text-sm text-neutral-600 max-w-xs mx-auto leading-relaxed">
                {errorMessage || 'Google authentication could not be completed.'}
              </p>
            </>
          ) : status === 'success' ? (
            <>
              <h2 className="text-xl font-black text-neutral-900 tracking-tight">Login Successful</h2>
              <p className="text-sm text-neutral-600">
                Session established! Redirecting to your account dashboard...
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-black text-neutral-900 tracking-tight">Authenticating with Google</h2>
              <p className="text-sm text-neutral-500 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Exchanging authorization code & restoring session...</span>
              </p>
            </>
          )}
        </div>

        {/* Action Buttons for Error */}
        {status === 'error' && (
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              to="/login"
              className="w-full h-11 bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <span>Return to Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="w-full h-11 bg-neutral-100 text-neutral-700 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center hover:bg-neutral-200 transition-colors"
            >
              Go to Store Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
