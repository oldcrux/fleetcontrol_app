import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function Button({ children, icon, className, disabled, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={clsx(
        'flex items-center rounded-lg bg-blue-500 text-white font-medium transition-colors',
        {
          // Default styles
          'h-10 px-4 text-xl': true, // Default large button size (large screens)
          
          // Responsive styles (for small screens)
          'sm:h-8 sm:px-3 sm:text-sm': true, // Smaller button size and text on small screens

          // Disable state
          'cursor-not-allowed opacity-50': disabled, // Disabled styles
          // Hover, focus, and active states
          'hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600':
            !disabled, // Apply hover/focus/active styles when not disabled
        },
        className
      )}
    >
      {/* Conditionally render the text and icon */}
      
      {/* Dynamically render the passed icon, with responsive size */}
      {icon && (
        <span className="mr-1">
          {icon}
        </span>
      )}
      <span className="hidden sm:block">{children}</span> {/* Text is hidden on small screens */}
    </button>

  );
}
