'use client';

import { ReactNode, useEffect, useState } from 'react';
import { I18nProvider, useI18n } from '@/lib/i18n';
import DevAuth from './DevAuth';

function LayoutContent({ children }: { children: ReactNode }) {
  const { dir } = useI18n();
  
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = dir === 'rtl' ? 'he' : 'en';
  }, [dir]);

  return (
    <>
      <DevAuth />
      {children}
    </>
  );
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <>
        <div className="dev-auth">
          <span>Loading...</span>
        </div>
        {children}
      </>
    );
  }

  return (
    <I18nProvider>
      <LayoutContent>{children}</LayoutContent>
    </I18nProvider>
  );
}
