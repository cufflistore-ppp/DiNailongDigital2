/**
 * Konfigurasi auto-deploy Vercel / Netlify
 * ------------------------------------------------
 * API YANG DIPERLUKAN:
 * 1) NETLIFY_TOKEN — app.netlify.com → User settings → Personal access tokens
 * 2) VERCEL_TOKEN  — vercel.com/account/tokens → Create (Full Account)
 * 3) Firebase Storage (opsional) untuk ZIP lintas device
 */
window.NailongDeployConfig = {
  NETLIFY_TOKEN: 'nfp_iBK7HaTgW39RpQkwBGtHzPVs9VVWVtXJaa70',
  NETLIFY_API: 'https://api.netlify.com/api/v1',
  VERCEL_TOKEN: 'vcp_3BNv179KqTW9xAIp5tqRFZYRNqxMurr0Q17L3uJHz34Y52OyWH0tEMXq',
  VERCEL_API: 'https://api.vercel.com',
  VERCEL_TEAM_ID: '',
  AUTO_DEPLOY: true
};
