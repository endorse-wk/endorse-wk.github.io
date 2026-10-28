export const proxyThumb = (url: string | undefined | null, fallbackSeed: string | number = 'default'): string => {
  if (!url || url.trim() === '') {
    return `https://picsum.photos/seed/${fallbackSeed}/640/360`;
  }
  
  // Strip protocol for wsrv.nl if needed, or just pass full URL encoded.
  // wsrv.nl is a free, fast, global image proxy/cache that bypasses hotlink blocks.
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}`;
};
