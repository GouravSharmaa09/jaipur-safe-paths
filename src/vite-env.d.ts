/// <reference types="vite/client" />

declare global {
  interface Window {
    google: any;
    voiceflow?: any;
  }
  
  const google: any;
  
  interface GeolocationPositionError {
    code: number;
    message: string;
  }
}

export {};
