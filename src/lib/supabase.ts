// // src/lib/supabase.ts
// import { createClient } from '@supabase/supabase-js';
// import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../utils/supabase/info";

// const baseUrl = (SUPABASE_URL ?? "").trim();
// const anonKey = (SUPABASE_ANON_KEY ?? "").trim();
// if (!baseUrl || !anonKey) {
//   throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
// }

// export const supabase = createClient(baseUrl, anonKey);

// // Auth helper functions
// export const authHelpers = {
//   async signUp(email: string, password: string, name: string) {
//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         data: {
//           name,
//         },
//       },
//     });
//     return { data, error };
//   },

//   async signIn(email: string, password: string) {
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });
//     return { data, error };
//   },

//   async signOut() {
//     const { error } = await supabase.auth.signOut();
//     return { error };
//   },

//   async getCurrentUser() {
//     const { data: { user }, error } = await supabase.auth.getUser();
//     return { user, error };
//   },

//   async getSession() {
//     const { data: { session }, error } = await supabase.auth.getSession();
//     return { session, error };
//   },

//   // Google OAuth
//   async signInWithGoogle() {
//     const { data, error } = await supabase.auth.signInWithOAuth({
//       provider: 'google',
//     });
//     return { data, error };
//   },
// };
