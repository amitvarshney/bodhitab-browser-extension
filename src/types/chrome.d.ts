// Type definitions for Chrome extension API
// This file provides TypeScript type definitions for the Chrome API used in this extension

interface Chrome {
  storage: {
    local: {
      get: (key: string | string[] | object | null, callback?: (items: { [key: string]: any }) => void) => Promise<{ [key: string]: any }>;
      set: (items: { [key: string]: any }, callback?: () => void) => Promise<void>;
      remove: (keys: string | string[], callback?: () => void) => Promise<void>;
      clear: (callback?: () => void) => Promise<void>;
      getBytesInUse: (keys: string | string[] | null, callback: (bytesInUse: number) => void) => void;
    };
    sync: {
      get: (key: string | string[] | object | null, callback?: (items: { [key: string]: any }) => void) => Promise<{ [key: string]: any }>;
      set: (items: { [key: string]: any }, callback?: () => void) => Promise<void>;
      remove: (keys: string | string[], callback?: () => void) => Promise<void>;
      clear: (callback?: () => void) => Promise<void>;
      getBytesInUse: (keys: string | string[] | null, callback: (bytesInUse: number) => void) => void;
    };
    session: {
      get: (key: string | string[] | object | null, callback?: (items: { [key: string]: any }) => void) => Promise<{ [key: string]: any }>;
      set: (items: { [key: string]: any }, callback?: () => void) => Promise<void>;
      remove: (keys: string | string[], callback?: () => void) => Promise<void>;
      clear: (callback?: () => void) => Promise<void>;
    };
    onChanged: {
      addListener: (callback: (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => void) => void;
      removeListener: (callback: (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => void) => void;
    };
  };
  runtime: {
    lastError?: {
      message: string;
    };
    getURL: (path: string) => string;
    getManifest: () => any;
  };
  tabs: {
    create: (createProperties: object, callback?: (tab: any) => void) => void;
    query: (queryInfo: object, callback: (result: any[]) => void) => void;
    update: (tabId: number, updateProperties: object, callback?: (tab?: any) => void) => void;
  };
}

declare namespace chrome.storage {
  interface StorageChange {
    oldValue?: any;
    newValue?: any;
  }
}

declare var chrome: Chrome;
