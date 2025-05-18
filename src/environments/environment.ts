export const environment = {
  production: false,
  supabaseUrl: process.env['SUPABASE_URL'] || '',
  supabaseKey: process.env['SUPABASE_KEY'] || '',
  testUserId: '00000000-0000-0000-0000-000000000001', // Test user ID for development
  openRouterApiKey: '',
  openRouterBaseUrl: 'https://openrouter.ai/api/chat/completions'
};