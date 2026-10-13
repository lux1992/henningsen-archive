// Efter build: forside, der sender videre til det rigtige sprog (og gamle #lampe-links til lampens side), og en 404-side.
import fs from 'fs';
const B = process.env.BASE_PATH || '';
const page = (title, body) => `<!doctype html><html lang="da"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title>
<style>body{font:17px/1.5 Georgia,serif;margin:0;padding:15vh 16px;text-align:center;background:#f6f6f3;color:#16181b}a{color:#24508f}@media(prefers-color-scheme:dark){body{background:#141619;color:#eceae4}a{color:#8db4ea}}</style>${body}`;
fs.writeFileSync('out/index.html', page('PH-arkivet', `<meta http-equiv="refresh" content="1;url=${B}/da/">
<script>const l=/^(da|nb|no|nn|sv)/.test(navigator.language)?'da':'en',h=location.hash.slice(1);location.replace('${B}/'+l+'/'+(/^[a-z0-9]+$/.test(h)?(l==='da'?'lamper':'lamps')+'/'+h+'/':''))</script>
<p><a href="${B}/da/">PH-arkivet</a> · <a href="${B}/en/">PH Archive</a></p>`));
fs.writeFileSync('out/404.html', page('Siden findes ikke · Page not found', `<h1>Siden findes ikke</h1><p>Page not found</p><p><a href="${B}/da/">PH-arkivet</a> · <a href="${B}/en/">PH Archive (English)</a></p>`));
