// Vercel Serverless Function — /api/subscribe
// Cache la clé API Brevo côté serveur, jamais visible dans le HTML

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, course } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Email invalide' });
  }

  try {
    const attributes = {};
    if (name) attributes.PRENOM = name;
    if (course) attributes.COURSE = course;

    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY // ← clé stockée côté serveur, jamais exposée
      },
      body: JSON.stringify({
        email: email,
        attributes: attributes,
        listIds: [3],
        updateEnabled: true
      })
    });

    if (brevoRes.ok || brevoRes.status === 201 || brevoRes.status === 204) {
      return res.status(200).json({ success: true });
    } else {
      const errData = await brevoRes.json().catch(() => ({}));
      return res.status(brevoRes.status).json({ error: 'Brevo API error', details: errData });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}
