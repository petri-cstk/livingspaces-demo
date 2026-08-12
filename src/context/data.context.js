"use client";

import React, { useContext, createContext } from 'react';

const DataContext = createContext({});

const CommerceFallbackContext = createContext(null);

const PlpCommercePrefetchContext = createContext(null);

// Server-fetched header entry (logo + nav), provided on every route so the
// Header can render on the first paint instead of popping in after a client
// fetch and pushing the page down.
const HeaderContext = createContext(null);

export function useDataContext() {
  return useContext(DataContext);
}

/** SSR-prefetched header entry array (logo + nav) for first-paint rendering. */
export function useHeaderData() {
  return useContext(HeaderContext);
}

export function HeaderDataProvider({ header, children }) {
  return <HeaderContext.Provider value={header}>{children}</HeaderContext.Provider>;
}

/** SSR-prefetched commerce product when there is no Contentstack PDP entry. */
export function useCommerceFallback() {
  return useContext(CommerceFallbackContext);
}

/** SSR-prefetched PLP category, products, and filters for the current category URL. */
export function usePlpCommercePrefetch() {
  return useContext(PlpCommercePrefetchContext);
}

export default function DataContextProvider({ data, commerceFallback = null, plpCommercePrefetch = null, children }) {
  return (
    <DataContext.Provider value={data}>
      <CommerceFallbackContext.Provider value={commerceFallback}>
        <PlpCommercePrefetchContext.Provider value={plpCommercePrefetch}>
          {children}
        </PlpCommercePrefetchContext.Provider>
      </CommerceFallbackContext.Provider>
    </DataContext.Provider>
  );
}