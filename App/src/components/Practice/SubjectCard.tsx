import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface SubjectCardProps {
  title: string;
  icon: LucideIcon;
  count: number;
  gradient: string;
  onClick: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ title, icon: Icon, count, gradient, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-3xl p-8 cursor-pointer shadow-xl ${gradient} text-white h-64 group`}
      onClick={onClick}
    >
      <div className="absolute -right-10 -bottom-10 opacity-10 transition-transform group-hover:scale-110 group-hover:rotate-12 duration-500">
        <Icon size={200} />
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="bg-white/20 w-fit p-3 rounded-2xl mb-auto">
          <Icon size={28} />
        </div>
        
        <div>
          <h3 className="text-3xl font-black mb-2 tracking-tight">{title}</h3>
          <p className="text-white/80 font-medium tracking-wide text-sm">
            {count} Questions Available
          </p>
        </div>
        
        <div className="mt-4 flex items-center gap-2">
          <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '40%' }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-white"
            />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
            40% Progress
          </span>
        </div>
      </div>
    </motion.div>
  );
};
