import { Button, useMediaQuery, useTheme } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
  }

const MUIButton = ({ children, disabled, className, ...rest }: ButtonProps) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // Checks if screen is small

  return (
    <Button
    //   {...rest}
      disabled={disabled}
      sx={{
        display: 'flex',
        alignItems: 'center',
        borderRadius: '2px',
        paddingX: 4,
        paddingY: 2,
        fontSize: '.5rem', // Default font size
        fontWeight: '500',
        backgroundColor: 'primary.main',
        color: 'white',
        transition: 'background-color 0.3s',
        '&:hover': {
          backgroundColor: !disabled ? 'primary.dark' : undefined,
        },
        '&:active': {
          backgroundColor: !disabled ? 'primary.dark' : undefined,
        },
        '&.Mui-disabled': {
          backgroundColor: '#3b82f6',
          opacity: 0.5,
        },
        // Responsive styles
        height: isSmallScreen ? '30px' : '40px', // Smaller button height on small screens
        // fontSize: isSmallScreen ? '0.875rem' : '1rem', // Smaller font size on small screens
        // paddingX: isSmallScreen ? 2 : 4, // Less padding on small screens
        // paddingY: isSmallScreen ? 1 : 2, // Less padding on small screens
        // Custom classnames if provided
        // ...className,
      }}
      className={className}
    >
      {isSmallScreen ? (
        <OpenInNewIcon className="text-xl" /> // Show icon on small screens
      ) : (
        <>{children || <OpenInNewIcon />}</> // Regular text or another icon for larger screens
      )}
    </Button>
  );
};

export default MUIButton;
