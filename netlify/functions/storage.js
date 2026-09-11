const { getStore } = require("@netlify/blobs");

// Petite fonction API : GET pour lire une clé, POST pour l'écrire.
// Sert de base de données partagée pour toute l'appli Pichaury.
exports.handler = async (event) => {
  const store = getStore("pichaury");
  const key = event.queryStringParameters && event.queryStringParameters.key;

  if (!key) {
    return { statusCode: 400, body: JSON.stringify({ error: "missing key" }) };
  }

  try {
    if (event.httpMethod === "GET") {
      const value = await store.get(key);
      return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ value: value === undefined ? null : value }),
      };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      await store.set(key, body.value);
      return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ok: true }),
      };
    }

    return { statusCode: 405, body: "Method not allowed" };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) }),
    };
  }
};
