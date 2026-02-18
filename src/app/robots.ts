import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/app/', '/api/', '/auth/', '/login', '/reset-password'],
    },
    sitemap: 'https://forgia.fit/sitemap.xml',
  };
}
