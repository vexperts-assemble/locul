import { useSupabase } from "./useSupabase";

export const useSignUp = () => {
  const { isLoaded, supabase } = useSupabase();

  const signUp = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // Disable email confirmation
      },
    });
    if (error) throw error;
    return data;
  };

  const verifyOtp = async ({
    email,
    token,
  }: {
    email: string;
    token: string;
  }) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) throw error;
  };

  return {
    isLoaded,
    signUp,
    verifyOtp,
  };
};
