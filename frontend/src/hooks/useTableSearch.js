import { useMemo, useState } from 'react';

export const useTableSearch = (data, keys) => {
  const [query, setQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!query) return data;

    const lowerQuery = query.toLowerCase();

    return data.filter(row =>
      keys.some(key => String(row[key]).toLowerCase().includes(lowerQuery))
    );
  }, [query, data, keys]);

  return { query, setQuery, filteredData };
};
