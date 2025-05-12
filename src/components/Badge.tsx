import React from 'react';
import styles from './Badge.module.scss';

interface BadgeProps {
  label?: string;       // Optional label text (e.g., "Intensity:")
  value: React.ReactNode; // The main content of the badge
  className?: string;   // Allow custom class for additional styling if needed
  // Future: Add variant prop for different colors e.g., variant: 'primary' | 'success' | 'warning'
}

const Badge: React.FC<BadgeProps> = ({ label, value, className }) => {
  return (
    <span className={`${styles.badge} ${className || ''}`}>
      {label && <strong className={styles.label}>{label}</strong>}
      {value}
    </span>
  );
};

export default Badge; 