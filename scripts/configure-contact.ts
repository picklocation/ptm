import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const {settings,put}=await import('../src/lib/store');
await put('settings','site',{...await settings(),whatsapp:'917902220044'});
console.log('WhatsApp configured.');
