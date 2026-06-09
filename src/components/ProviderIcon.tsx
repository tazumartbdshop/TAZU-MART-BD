import { Mail, Smartphone } from 'lucide-react';
import React from 'react';

export function getProviderIcon(id: string) {
  switch (id) {
    case 'google': return <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />;
    case 'facebook': return <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-4 h-4" alt="Facebook" />;
    case 'apple': return <img src="https://www.svgrepo.com/show/511330/apple-173.svg" className="w-4 h-4 transition-all group-hover:scale-110" alt="Apple" />;
    case 'microsoft': return <img src="https://www.svgrepo.com/show/475666/microsoft-color.svg" className="w-4 h-4 transition-all group-hover:scale-110" alt="Microsoft" />;
    case 'github': return <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-4 h-4 transition-all group-hover:scale-110" alt="GitHub" />;
    case 'twitter': return <img src="https://www.svgrepo.com/show/448270/x-logo.svg" className="w-4 h-4 transition-all group-hover:scale-110" alt="X/Twitter" />;
    case 'yahoo': return <img src="https://www.svgrepo.com/show/354580/yahoo.svg" className="w-4 h-4 transition-all group-hover:scale-110" alt="Yahoo" />;
    case 'phone': return <Smartphone className="w-4 h-4 text-neutral-600 transition-all group-hover:scale-110" />;
    case 'email_link': return <Mail className="w-4 h-4 text-neutral-600 transition-all group-hover:scale-110" />;
    default: return <div className="w-4 h-4 bg-neutral-200 rounded-full" />;
  }
}
