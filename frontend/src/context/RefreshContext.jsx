import { createContext, useContext, useState, useCallback } from 'react';
import { refreshUserState } from '../auth/authService';

const RefreshContext = createContext();

export const useRefresh = () => useContext(RefreshContext);

export const RefreshProvider = ({ children }) => {
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [blink, setBlink] = useState(false);

  const triggerRefresh = useCallback(() => {
    setBlink(true);
    refreshUserState();
    setRefreshSignal(prev => prev + 1); // new value signals a refresh
    setTimeout(() => {
      setBlink(false); // remove blink after 300ms
    }, 300);
  }, []);

  return (
    <RefreshContext.Provider value={{ refreshSignal, triggerRefresh, blink }}>
      {children}
    </RefreshContext.Provider>
  );
};
