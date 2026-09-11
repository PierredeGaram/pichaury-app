const { getStore } = require("@netlify/blobs");

// Petite fonction API : GET pour lire une clé, POST pour l'écrire.
// Sert de base de données partagée pour toute l'appli Pichaury.
//
// siteID/token fournis explicitement via des variables d'environnement Netlify
// (BLOBS_SITE_ID / BLOBS_TOKEN), pour contourner un bug connu où Netlify n'injecte
// pas toujours automatiquement le contexte Blobs dans la fonction.
exports.handler = async (event) => {
  const store = getStore({
    name: "pichaury",
    siteID: process.env.BLOBS_SITE_ID,
    token: process.env.BLOBS_TOKEN,
  });
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
