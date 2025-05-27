import { createContext, useContext, useState } from 'react';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const openProfile = () => {
    setIsOpen(true);
    setIsEditOpen(false); // ✅ ensures only profile panel opens
  };
  const closeProfile = () => setIsOpen(false);
  const toggleProfile = () => setIsOpen(prev => !prev);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const openEdit = () => setIsEditOpen(true);
  const closeEdit = () => setIsEditOpen(false);
  const toggleEdit = () => setIsEditOpen(prev => !prev);

  const resetProfileState = () => {
    setIsOpen(false);
    setIsEditOpen(false);
  };

  return (
    <ProfileContext.Provider value={{
      isOpen, openProfile, closeProfile, toggleProfile,
      isEditOpen, openEdit, closeEdit, toggleEdit,
      resetProfileState
    }}>
      {children}
    </ProfileContext.Provider>
  );
};
