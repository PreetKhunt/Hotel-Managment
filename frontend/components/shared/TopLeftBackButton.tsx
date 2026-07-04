'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface TopLeftBackButtonProps {
  className?: string;
}

export default function TopLeftBackButton({ className = '' }: TopLeftBackButtonProps) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 group ${className}`}>
      <motion.div
        whileHover={{ x: -4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.2)] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#060B16] transition-colors font-medium text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </motion.div>
    </Link>
  );
}
