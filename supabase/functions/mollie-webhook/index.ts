import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const formData = await req.formData();
    const paymentId = formData.get("id") as string;

    if (!paymentId) {
      return new Response("Missing payment id", { status: 400 });
    }

    const mollieApiKey = Deno.env.get("MOLLIE_API_KEY");
    if (!mollieApiKey) {
      throw new Error("MOLLIE_API_KEY not configured");
    }

    const mollieRes = await fetch(
      `https://api.mollie.com/v2/payments/${paymentId}`,
      {
        headers: { Authorization: `Bearer ${mollieApiKey}` },
      },
    );

    if (!mollieRes.ok) {
      throw new Error(`Mollie fetch failed: ${mollieRes.status}`);
    }

    const payment = await mollieRes.json();

    const tipId = payment.metadata?.tip_id;
    if (!tipId) {
      throw new Error("No tip_id in payment metadata");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    await supabase
      .from("tips")
      .update({
        status: payment.status,
        mollie_payment_id: paymentId,
      })
      .eq("id", tipId);

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
