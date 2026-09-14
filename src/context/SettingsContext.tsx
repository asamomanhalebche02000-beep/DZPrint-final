import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SiteSettings } from '../types';
import { initMetaPixel } from '../lib/metaPixel';

interface SettingsContextType {
  settings: SiteSettings | null;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  updateLocalSettings: (newSettings: Partial<SiteSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  isLoading: true,
  refreshSettings: async () => {},
  updateLocalSettings: () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data: SiteSettings = await res.json();
        setSettings(data);
        // Initialize Meta Pixel if enabled
        if (data.meta_pixel_id && data.meta_pixel_enabled) {
          initMetaPixel(data.meta_pixel_id, true);
        }
      }
    } catch (err) {
      console.warn('[SettingsProvider]: Failed to fetch site settings', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateLocalSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings(prev => (prev ? { ...prev, ...newSettings } : null));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        refreshSettings: fetchSettings,
        updateLocalSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSiteSettings() {
  return useContext(SettingsContext);
}
