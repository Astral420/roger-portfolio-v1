import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-300 ease-premium focus-visible:outline-offset-4 disabled:opacity-50 disabled:pointer-events-none';

const variants = {
  primary:
    'bg-primary text-bg px-5 py-2.5 hover:-translate-y-0.5 hover:shadow-glow active:translate-y-0',
  ghost:
    'border border-border/12 text-primary px-5 py-2.5 hover:border-border/25 hover:bg-primary/[0.03]',
  subtle: 'text-secondary hover:text-primary px-3 py-2',
};

type Variant = keyof typeof variants;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  children: ReactNode;
}

export function LinkButton({ variant = 'primary', className = '', children, ...props }: LinkButtonProps) {
  return (
    <a className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </a>
  );
}
