interface GtagEventParams {
  [key: string]: string | number | boolean | undefined;
}

interface Window {
  gtag?: (
    command: 'event' | 'config' | 'set',
    targetOrAction: string,
    params?: GtagEventParams
  ) => void;
}
