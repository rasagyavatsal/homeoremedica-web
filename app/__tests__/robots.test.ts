import robots from '../robots';

describe('robots.txt metadata route', () => {
  it('generates correct rules and sitemap for production', () => {
    const output = robots();

    expect(output.sitemap).toBe('https://homeoremedica.com/sitemap.xml');
    expect(output.host).toBe('homeoremedica.com');
    expect(output.rules).toEqual([
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/settings', '/cases'],
      },
    ]);
  });
});
