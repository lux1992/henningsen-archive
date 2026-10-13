import { SITE } from '../lib/data';

export const dynamic = 'force-static';
export default () => ({ rules: { userAgent: '*', allow: '/' }, sitemap: `${SITE}/sitemap.xml` });
