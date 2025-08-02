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

  try {
    const { rows } = await sql`
      SELECT 
        COUNT(*)::int as total_bookmarks,
        COUNT(DISTINCT unnest(tags))::int as unique_tags,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END)::int as recent_activity
      FROM bookmarks 
      WHERE user_id = ${userId}
    `;

    const stats = rows[0] || { 
      total_bookmarks: 0, 
      unique_tags: 0, 
      recent_activity: 0 
    };

    return res.status(200).json({
      totalBookmarks: stats.total_bookmarks,
      uniqueTags: stats.unique_tags,
      recentActivity: stats.recent_activity
    });

  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}