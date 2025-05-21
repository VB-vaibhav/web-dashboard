export const hasAccess = (role, permissions, key) => {
  if (role === 'superadmin') return true;
  return permissions?.[key] === 1;
};
