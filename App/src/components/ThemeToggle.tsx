import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type Theme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getIcon = () => {
    switch (theme) {
      case 'light': return <Sun size={20} />;
      case 'dark': return <Moon size={20} />;
      case 'system': return <Monitor size={20} />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light': return 'Light Mode';
      case 'dark': return 'Dark Mode';
      case 'system': return 'System Default';
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={cycleTheme}
      className={`relative h-10 px-3 flex items-center gap-2 rounded-xl transition-all duration-300 group
        ${theme === 'dark' 
          ? 'bg-slate-800 text-slate-200 border border-slate-700 shadow-lg shadow-indigo-500/10' 
          : 'bg-white text-slate-600 border border-slate-200 shadow-sm hover:border-slate-300'
        }`}
      title={`Current: ${getLabel()}. Click to change.`}
    >
      <div className="flex items-center justify-center w-5 h-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ y: 10, opacity: 0, scale: 0.5, rotate: -45 }}
            animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
            exit={{ y: -10, opacity: 0, scale: 0.5, rotate: 45 }}
            transition={{ duration: 0.2, ease: 'backOut' }}
          >
            {getIcon()}
          </motion.div>
        </AnimatePresence>
      </div>
      
      <span className="text-sm font-medium hidden sm:inline-block">
        {getLabel()}
      </span>

      {/* Subtle indicator for system if active */}
      {theme === 'system' && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-800" />
      )}
    </motion.button>
  );
};
