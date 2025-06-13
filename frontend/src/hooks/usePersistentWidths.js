// import { useEffect, useState } from 'react';

// // export const usePersistentWidths = (pageKey, columnCount, defaultWidth = 150) => {
// //   const storageKey = `columnWidths_${pageKey}`;
// //   const [widths, setWidths] = useState(Array(columnCount).fill(defaultWidth));

// //   useEffect(() => {
// //     const saved = localStorage.getItem(storageKey);
// //     if (saved) {
// //       try {
// //         const parsed = JSON.parse(saved);
// //         if (Array.isArray(parsed) && parsed.length === columnCount) {
// //           setWidths(parsed);
// //         }
// //       } catch {
// //         console.warn(`Corrupt column widths in localStorage for ${pageKey}`);
// //       }
// //     }
// //   }, [columnCount, storageKey]);

// //   useEffect(() => {
// //     localStorage.setItem(storageKey, JSON.stringify(widths));
// //   }, [widths, storageKey]);

// //   return [widths, setWidths];
// // };



// export const usePersistentWidths = (pageKey, columnCount, defaultWidth = 150) => {
//   const storageKey = `columnWidths_${pageKey}`;
//   const [widths, setWidths] = useState(Array(columnCount).fill(defaultWidth));

//   useEffect(() => {
//     const saved = localStorage.getItem(storageKey);
//     if (saved) {
//       try {
//         const parsed = JSON.parse(saved);
//         if (Array.isArray(parsed)) {
//           const padded = parsed.concat(
//             Array(Math.max(0, columnCount - parsed.length)).fill(defaultWidth)
//           ).slice(0, columnCount);
//           setWidths(padded);
//         }
//       } catch {
//         console.warn(`Corrupt column widths in localStorage for ${pageKey}`);
//       }
//     }
//   }, [columnCount, storageKey]);

//   useEffect(() => {
//     localStorage.setItem(storageKey, JSON.stringify(widths));
//   }, [widths, storageKey]);

//   return [widths, setWidths];
// };



import { useState, useEffect } from 'react';

export const usePersistentWidths = (key, totalCols, defaultWidth = 150) => {
  const [columnWidths, setColumnWidths] = useState(() => {
    try {
      const saved = localStorage.getItem(`columnWidths_${key}`);
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed)) {
        return parsed.concat(Array(Math.max(0, totalCols - parsed.length)).fill(defaultWidth)).slice(0, totalCols);
      }
    } catch {
      // ignore error
    }
    return Array(totalCols).fill(defaultWidth);
  });

  useEffect(() => {
    localStorage.setItem(`columnWidths_${key}`, JSON.stringify(columnWidths));
  }, [key, columnWidths]);

  return [columnWidths, setColumnWidths];
};
