export default async function handler(req, res) {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ error: "Missing token" });
  }

  const SHOPIFY_DOMAIN = 'tuqhcs-7a.myshopify.com'; // your domain
  const STOREFRONT_TOKEN = '3ea7963fedd614e5499e1b317f2305b6'; // your token

  const query = `
    query {
      customer(customerAccessToken: "${token}") {
        id
        email
      }
    }
  `;

  try {
    const shopifyRes = await fetch(`https://${SHOPIFY_DOMAIN}/api/2023-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query })
    });

    const shopifyData = await shopifyRes.json();
    const customer = shopifyData?.data?.customer;

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const impactStats = {
      orderCount: 1,
      farmsSupported: 5,
      pesticidesAvoided: 2,
      fertilizersAvoided: 21,
      carbonSequestered: 2.5,
      carbonFootprintAvoided: 2,
      waterSaved: 40
    };

    res.status(200).json({
      ...impactStats,
      customerId: customer.id,
      email: customer.email
    });
  } catch (err) {
    console.error("Error in /api/hello:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
