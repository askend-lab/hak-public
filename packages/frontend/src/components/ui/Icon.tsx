export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type IconWeight = 'light' | 'regular' | 'medium' | 'bold';

interface IconProps {
  name: string;
  size?: IconSize;
  weight?: IconWeight;
  filled?: boolean;
  className?: string;
}

export const Icon = ({ 
  name, 
  size = 'lg', 
  weight = 'regular', 
  filled = false,
  className 
}: IconProps) => {
  const classes = [
    'icon',
    `icon--${size}`,
    `icon--${weight}`,
    filled && 'icon--filled',
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} aria-hidden="true">
      {name}
    </span>
  );
};
