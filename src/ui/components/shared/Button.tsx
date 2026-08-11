import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

/** Large, rounded, high-contrast tap target — sized for young children on touch devices. */
export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  const classes = ['sq-button', `sq-button--${variant}`, className].filter(Boolean).join(' ');
  return <button type="button" className={classes} {...props} />;
}
