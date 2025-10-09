import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import VaultItem from '@/models/VaultItem';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = session.user.id;

  try {
    await connectDB();

    switch (req.method) {
      case 'GET':
        const items = await VaultItem.find({ userId }).sort({ createdAt: -1 });
        return res.status(200).json(items);

      case 'POST':
        const { title, username, encryptedPassword, url, notes } = req.body;

        if (!title || !encryptedPassword) {
          return res.status(400).json({ message: 'Title and password are required' });
        }

        const newItem = new VaultItem({
          userId,
          title,
          username,
          encryptedPassword,
          url,
          notes,
        });

        const savedItem = await newItem.save();
        return res.status(201).json(savedItem);

      case 'PUT':
        const { id, ...updateData } = req.body;

        if (!id) {
          return res.status(400).json({ message: 'Item ID is required' });
        }

        const updatedItem = await VaultItem.findOneAndUpdate(
          { _id: id, userId },
          updateData,
          { new: true }
        );

        if (!updatedItem) {
          return res.status(404).json({ message: 'Item not found' });
        }

        return res.status(200).json(updatedItem);

      case 'DELETE':
        const { id: deleteId } = req.body;

        if (!deleteId) {
          return res.status(400).json({ message: 'Item ID is required' });
        }

        const deletedItem = await VaultItem.findOneAndDelete({
          _id: deleteId,
          userId,
        });

        if (!deletedItem) {
          return res.status(404).json({ message: 'Item not found' });
        }

        return res.status(200).json({ message: 'Item deleted successfully' });

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Vault API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
