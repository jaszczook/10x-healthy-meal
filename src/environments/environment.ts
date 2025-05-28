export const environment = {
  production: false,
  supabaseUrl: process.env['SUPABASE_URL'] || '',
  supabaseKey: process.env['SUPABASE_KEY'] || '',
  testUserId: '00000000-0000-0000-0000-000000000001', // Test user ID for development
  openRouterApiKey: process.env['OPENROUTER_API_KEY'] || '',
  openRouterBaseUrl: 'https://openrouter.ai/api/v1/chat/completions'
};