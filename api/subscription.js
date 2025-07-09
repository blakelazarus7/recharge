export default async function handler(req, res) {
  const RECHARGE_API_KEY = "sk_1x1_195a6d72ab5445ab862e1b1c36afeb23d4792ea170cd8b698a999eb8322bb81c";
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  try {
    // Step 1: Get customer by email
    const customerResp = await fetch(`https://api.rechargeapps.com/customers?email=${encodeURIComponent(email)}`, {
      headers: {
        "X-Recharge-Access-Token": RECHARGE_API_KEY,
        "Accept": "application/json"
      }
    });

    const customerData = await customerResp.json();

    if (!customerData.customers || customerData.customers.length === 0) {
      return res.status(404).json({ error: "Customer not found in Recharge" });
    }

    const customerId = customerData.customers[0].id;

    // Step 2: Get subscriptions by customer ID
    const subResp = await fetch(`https://api.rechargeapps.com/subscriptions?customer_id=${customerId}`, {
      headers: {
        "X-Recharge-Access-Token": RECHARGE_API_KEY,
        "Accept": "application/json"
      }
    });

    const subData = await subResp.json();

    if (!subData.subscriptions || subData.subscriptions.length === 0) {
      return res.status(404).json({ error: "No subscriptions found" });
    }

    // 🔍 DEBUG LOG — so we can see the full object
    console.log("🔍 Recharge subscription object:", JSON.stringify(subData.subscriptions, null, 2));

    const subscriptions = subData.subscriptions.map(sub => {
      const unit = sub.order_interval_unit;
      const count = parseInt(sub.order_interval_frequency);

      let frequency = "Unknown";

      if (unit === "day") {
        if (count === 7) frequency = "Weekly";
        else if (count === 14) frequency = "Every Two Weeks";
        else if (count === 30) frequency = "Monthly";
      }

      return {
        product_title: sub.product_title,
        frequency: frequency,
        debug_unit: unit,
        debug_count: count
      };
    });

    res.status(200).json({ subscriptions });

  } catch (err) {
    console.error("Recharge Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
