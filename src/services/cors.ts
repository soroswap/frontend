import { NextApiRequest, NextApiResponse } from 'next';

const allowedOrigins = ['.soroswap.finance', 'localhost', 'paltalabs.vercel.app'];

export function cors(
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void
) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const origin = req.headers.origin || req.headers.referer || '';
        let hostname = '';
        try {
            const url = new URL(origin);
            hostname = url.hostname;
        } catch (e) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        if (!allowedOrigins.some((allowed) => hostname.endsWith(allowed))) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        return handler(req, res);
    };
}