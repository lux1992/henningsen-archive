// Statisk eksport: `npm run build` lægger hele sitet i out/. BASE_PATH bruges kun, når sitet ligger i en undermappe.
export default {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.BASE_PATH || '',
  env: { BASE_PATH: process.env.BASE_PATH || '', SITE_URL: process.env.SITE_URL || 'https://henningsen-archive.com' },
  images: { unoptimized: true },
};
