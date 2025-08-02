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
  const query = req.query.q || '';

  if (!query.trim()) {
    return res.status(200).json([]);
  }

  try {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    // Create search conditions for partial matching
    const searchConditions = searchTerms.map(term => `%${term}%`);
    
    const { rows } = await sql`
      SELECT * FROM bookmarks 
      WHERE user_id = ${userId}
      AND (
        tags::text ILIKE ANY(${searchConditions}) OR
        LOWER(title) LIKE ANY(${searchConditions}) OR
        LOWER(description) LIKE ANY(${searchConditions}) OR
        LOWER(url) LIKE ANY(${searchConditions})
      )
      ORDER BY updated_at DESC
    `;

    return res.status(200).json(rows);

  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}