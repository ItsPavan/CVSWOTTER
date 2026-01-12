import React from 'react';
import { motion } from 'framer-motion';

const Antigravity = ({ children, className = '', onClick }) => {
    return (
        <motion.div
            className={`${className}`}
            onClick={onClick}
            whileHover={{
                y: -5,
                scale: 1.01,
                boxShadow: '0 10px 30px -10px rgba(209, 125, 8, 0.3)',
                transition: { type: 'spring', stiffness: 300, damping: 20 }
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    );
};

export default Antigravity;
