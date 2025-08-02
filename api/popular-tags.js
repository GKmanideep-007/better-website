import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const userId = 'demo_user_123'; // In production, get from authentication
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { rows } = await sql`
      SELECT 
        unnest(tags) as tag,
        COUNT(*)::int as count
      FROM bookmarks 
      WHERE user_id = ${userId}
      GROUP BY unnest(tags)
      ORDER BY COUNT(*) DESC
      LIMIT ${limit}
    `;

    return res.status(200).json(rows);

  } catch (error) {
    console.error('Popular tags error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}