import React from 'react';

interface FooterProps {
  t: any;
}

export const Footer: React.FC<FooterProps> = ({ t }) => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 py-8 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          © 2025 AgroScan AI Pro. {t.rights}
        </p>
        <div className="flex gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
          <a href="#" className="hover:text-agro-600 dark:hover:text-agro-400 transition-colors">{t.privacy}</a>
          <a href="#" className="hover:text-agro-600 dark:hover:text-agro-400 transition-colors">{t.terms}</a>
          <a href="#" className="hover:text-agro-600 dark:hover:text-agro-400 transition-colors">{t.contact}</a>
        </div>
      </div>
    </footer>
  );
};