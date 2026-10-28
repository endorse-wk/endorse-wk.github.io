import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    AdProvider?: any[];
  }
}

interface AdBannerProps {
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ className = '' }) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Avoid double script loading
    const SCRIPT_ID = 'exoclick-ad-provider-script';
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.async = true;
      script.type = 'application/javascript';
      script.src = 'https://a.magsrv.com/ad-provider.js';
      document.body.appendChild(script);
    }

    // Push ExoClick zone configuration to the provider
    try {
      (window.AdProvider = window.AdProvider || []).push({ serve: {} });
    } catch (e) {
      console.error('ExoClick Ad load error:', e);
    }
  }, []);

  return (
    <div ref={adRef} className={`flex justify-center items-center my-6 min-h-[100px] overflow-hidden ${className}`}>
      {/* ExoClick Zone Tag */}
      <ins className="eas6a97888e2" data-zoneid="5766284"></ins>
    </div>
  );
};

export default AdBanner;
