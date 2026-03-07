import { useState, useEffect } from 'react';

export const useHydration = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Al usarse en un hook separado, ESLint suele ser menos restrictivo
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  return hydrated;
};