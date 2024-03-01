import enableCors from '@/middleware/cors';
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  enableCors(req, res);
  res.status(200).end('noop')
}