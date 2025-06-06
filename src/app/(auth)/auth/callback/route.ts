import { createClient } from "../../../../../supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirect_to = requestUrl.searchParams.get("redirect_to");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if user exists in our users table, if not create them
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existingUser) {
        await supabase.from("users").insert({
          id: data.user.id,
          user_id: data.user.id,
          name:
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            "",
          email: data.user.email || "",
          token_identifier: data.user.id,
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  // URL to redirect to after sign in process completes
  const redirectTo = redirect_to || "/dashboard";
  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}
