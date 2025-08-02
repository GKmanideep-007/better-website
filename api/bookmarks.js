import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const userId = 'demo_user_123'; // In production, get from authentication

  try {
    if (req.method === 'GET') {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      const { rows } = await sql`
        SELECT * FROM bookmarks 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;

      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { url, title, description, favicon, tags } = req.body;

      if (!url || !title) {
        return res.status(400).json({ message: 'URL and title are required' });
      }

      const { rows } = await sql`
        INSERT INTO bookmarks (user_id, url, title, description, favicon, tags)
        VALUES (${userId}, ${url}, ${title}, ${description || null}, ${favicon || null}, ${JSON.stringify(tags || [])})
        RETURNING *
      `;

      return res.status(201).json(rows[0]);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { url, title, description, favicon, tags } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Bookmark ID is required' });
      }

      const { rows } = await sql`
        UPDATE bookmarks 
        SET url = ${url}, title = ${title}, description = ${description || null}, 
            favicon = ${favicon || null}, tags = ${JSON.stringify(tags || [])}, updated_at = NOW()
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING *
      `;

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Bookmark not found' });
      }

      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ message: 'Bookmark ID is required' });
      }

      const { rowCount } = await sql`
        DELETE FROM bookmarks 
        WHERE id = ${id} AND user_id = ${userId}
      `;

      if (rowCount === 0) {
        return res.status(404).json({ message: 'Bookmark not found' });
      }

      return res.status(200).json({ message: 'Bookmark deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}