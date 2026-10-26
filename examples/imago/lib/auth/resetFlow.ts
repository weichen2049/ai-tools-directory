type AuthClient = {
  auth: {
    signOut: () => Promise<unknown>;
  };
};

type RouterLike = {
  push: (path: string) => void;
};

type ResetFlowOptions = {
  supabase: AuthClient;
  router: RouterLike;
  redirectPath?: string;
  delayMs?: number;
};

export async function completePasswordReset({
  supabase,
  router,
  redirectPath = "/",
  delayMs = 2000
}: ResetFlowOptions): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {
  }

  setTimeout(() => {
    router.push(redirectPath);
  }, delayMs);
}