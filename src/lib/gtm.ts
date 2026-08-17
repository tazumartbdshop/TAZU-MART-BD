
export const pushEvent = (eventName: string, eventData: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: eventName,
      ...eventData,
      timestamp: new Date().toISOString()
    });
  } else {
    console.warn(`GTM dataLayer not found, unable to push: ${eventName}`);
  }
};
