export default async function handler(req, res) {
  // ✅ CORS setup
  res.setHeader("Access-Control-Allow-Origin", "https://www.eatfare.com");
  res.setHeader("Access-Control-Allow-Methods", "PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "PUT") return res.status(405).json({ error: "Method not allowed" });

  const { subscriptionId, variantId, sellingPlanId } = req.body;

  if (!subscriptionId || !variantId || !sellingPlanId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const RECHARGE_API_KEY = "sUjadTdsAjFwwAcaEXASXXcAjssSgXX0aUJ0"; // ✅ use this one

  try {
    const response = await fetch(`https://api.rechargeapps.com/subscriptions/${subscriptionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Recharge-Access-Token": RECHARGE_API_KEY,
        "Accept": "application/json"
      },
      body: JSON.stringify({
        variant_id: variantId,
        selling_plan_id: sellingPlanId
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || "Failed to update subscription" });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Recharge update error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
