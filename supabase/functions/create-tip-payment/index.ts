import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { profile_id, amount, tipper_name, message, redirect_base_url } =
      await req.json();

    if (!profile_id || !amount || !redirect_base_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: tip, error: tipError } = await supabase
      .from("tips")
      .insert({
        profile_id,
        amount,
        tipper_name: tipper_name || "Anonymous",
        message: message || "",
        status: "pending",
      })
      .select("id")
      .single();

    if (tipError) {
      throw new Error(`Failed to create tip: ${tipError.message}`);
    }

    const mollieApiKey = Deno.env.get("MOLLIE_API_KEY");
    if (!mollieApiKey) {
      throw new Error("MOLLIE_API_KEY not configured");
    }

    const webhookBaseUrl = Deno.env.get("SUPABASE_URL")!;

    const mollieRes = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mollieApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: {
          currency: "EUR",
          value: Number(amount).toFixed(2),
        },
        description: `Tip for profile ${profile_id.substring(0, 8)}`,
        redirectUrl: `${redirect_base_url}/tip/return?tip_id=${tip.id}`,
        webhookUrl: `${webhookBaseUrl}/functions/v1/mollie-webhook`,
        metadata: {
          tip_id: tip.id,
          profile_id,
        },
      }),
    });

    if (!mollieRes.ok) {
      const errBody = await mollieRes.text();
      throw new Error(`Mollie API error: ${mollieRes.status} ${errBody}`);
    }

    const molliePayment = await mollieRes.json();

    await supabase
      .from("tips")
      .update({ mollie_payment_id: molliePayment.id })
      .eq("id", tip.id);

    return new Response(
      JSON.stringify({
        checkout_url: molliePayment._links.checkout.href,
        tip_id: tip.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
