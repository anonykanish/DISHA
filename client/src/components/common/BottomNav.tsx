import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Compass, Users, Route, Building2 } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();

  const navItems = [
    { to: '/dashboard', icon: Home, label: t('nav.home') },
    { to: '/navigation', icon: Compass, label: t('nav.map') },
    { to: '/queue', icon: Users, label: t('nav.queue') },
    { to: '/journey', icon: Route, label: t('nav.journey') },
    { to: '/facilities', icon: Building2, label: t('nav.facilities') },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-disha-darkBg/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 pb-safe">
      <nav className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 px-1 transition-colors ${
                isActive
                  ? 'text-disha-lightPrimary dark:text-disha-darkPrimary font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`
            }
          >
            <item.icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] truncate max-w-[64px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
