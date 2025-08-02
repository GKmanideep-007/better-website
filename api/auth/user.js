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

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // For demo purposes - in production, implement proper authentication
    // You can integrate with Vercel's authentication or use NextAuth.js
    const mockUser = {
      id: 'demo_user_123',
      email: 'demo@urilibrary.com',
      firstName: 'Demo',
      lastName: 'User',
      profileImageUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Ensure user exists in database
    await sql`
      INSERT INTO users (id, email, first_name, last_name, profile_image_url)
      VALUES (${mockUser.id}, ${mockUser.email}, ${mockUser.firstName}, ${mockUser.lastName}, ${mockUser.profileImageUrl})
      ON CONFLICT (id) DO NOTHING
    `;

    res.status(200).json(mockUser);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}