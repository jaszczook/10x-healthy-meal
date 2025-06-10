export const environment = {
  production: true,
  supabaseUrl: process.env['SUPABASE_URL'] || '',
  supabaseKey: process.env['SUPABASE_KEY'] || '',
  testUserId: '',
  openRouterApiKey: process.env['OPENROUTER_API_KEY'] || '',
  openRouterBaseUrl: 'https://openrouter.ai/api/v1/chat/completions'
}; 