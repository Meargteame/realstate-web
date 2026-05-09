import { useState, useEffect } from 'react';

interface Breakpoints {
  xs: boolean;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  xxl: boolean;
}

export const useBreakpoint = (): Breakpoints => {
  const [breakpoints, setBreakpoints] = useState<Breakpoints>({
    xs: false,
    sm: false,
    md: false,
    lg: false,
    xl: false,
    xxl: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      setBreakpoints({
        xs: width < 576,
        sm: width >= 576 && width < 768,
        md: width >= 768 && width < 992,
        lg: width >= 992 && width < 1200,
        xl: width >= 1200 && width < 1600,
        xxl: width >= 1600,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoints;
};

// Helper hook for mobile detection
export const useIsMobile = (): boolean => {
  const breakpoints = useBreakpoint();
  return breakpoints.xs || breakpoints.sm;
};

// Helper hook for tablet detection
export const useIsTablet = (): boolean => {
  const breakpoints = useBreakpoint();
  return breakpoints.md;
};

// Helper hook for desktop detection
export const useIsDesktop = (): boolean => {
  const breakpoints = useBreakpoint();
  return breakpoints.lg || breakpoints.xl || breakpoints.xxl;
};
