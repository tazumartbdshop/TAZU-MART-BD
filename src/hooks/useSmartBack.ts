import { useNavigate } from 'react-router-dom';

/**
 * Custom hook to handle smart Back button navigation.
 * Navigates one step back in history (-1) if history stack exists,
 * otherwise falls back to a safe default URL without full page reload.
 */
export function useSmartBack(defaultFallbackUrl: string = '/') {
  const navigate = useNavigate();

  const goBack = (fallbackOverride?: string) => {
    const fallback = fallbackOverride || defaultFallbackUrl;
    
    // Check if React Router history stack index > 0
    if (window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };

  return goBack;
}
