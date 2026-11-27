import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { UserModel, AllowedUserModel } from '../db/models.ts';

export interface AuthRequest extends Request {
  user?: any;
  dbUser?: any;
}

export const BASELINE_ALLOWED_EMAILS = [
  'shailesh.thakare@indushealthplus.com',
  'shashaank.d@indushealthplus.com',
  'balaji.hadole@indushealthplus.com',
  'samarth.patki@indushealthplus.com',
  'ecomm.indus@gmail.com'
];

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];

  // Development bypass token support for local testing without Firebase config
  if (token.startsWith('dev-token-') || token === 'mock-dev-token' || token === 'dev-mode') {
    const email = 'admin@indushealthplus.com';
    req.user = { uid: 'dev-user-001', email, name: 'Indus Admin' };
    req.dbUser = { id: 'dev-user-001', uid: 'dev-user-001', email, role: 'admin' };
    return next();
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;

    const email = (decodedToken.email || '').toLowerCase().trim();
    const uid = decodedToken.uid;

    if (!email) {
      return res.status(403).json({
        error: 'Forbidden: A verified email address is required to access this platform.',
        unauthorized: true
      });
    }

    // Check whether the email is present and active in allowed_users collection
    let allowedList: any[] = [];
    try {
      allowedList = await AllowedUserModel.find({
        email,
        status: 'active'
      }).lean();
    } catch (dbErr) {
      console.warn('Database offline while checking allowed_users, proceeding with domain rules.');
    }

    const isIndusDomain = email.endsWith('@indushealthplus.com') || email.endsWith('@indusites.com');
    const isWhitelisted = allowedList.length > 0 || BASELINE_ALLOWED_EMAILS.includes(email) || isIndusDomain;

    if (!isWhitelisted) {
      console.warn(`[Access Control] Unauthorized access attempt rejected for email: ${email}`);
      return res.status(403).json({
        error: `Access Denied: The account ${email} is not authorized to access this ABM platform. Please contact the administrator for access.`,
        unauthorized: true,
        email: email
      });
    }

    const defaultAdmins = [
      'shailesh.thakare@indushealthplus.com',
      'shashaank.d@indushealthplus.com',
      'balaji.hadole@indushealthplus.com',
      'samarth.patki@indushealthplus.com',
      'ecomm.indus@gmail.com'
    ];
    const role = allowedList[0]?.role || (defaultAdmins.includes(email) || email.includes('admin') || isIndusDomain ? 'admin' : 'member');

    req.dbUser = { id: uid, uid, email, role };
    try {
      let dbUserResult: any = await UserModel.findOne({ uid }).lean();
      if (!dbUserResult) {
        dbUserResult = await UserModel.findOneAndUpdate(
          { uid },
          { $set: { id: uid, uid, email, role } },
          { upsert: true, new: true, lean: true }
        );
      }
      if (dbUserResult) {
        req.dbUser = { ...dbUserResult, id: dbUserResult.id || dbUserResult.uid };
      }
    } catch (dbErr) {
      // Continue with in-memory session when DB is offline
    }

    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
export default requireAuth;
