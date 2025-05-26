import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException(
          'Missing or invalid authorization header',
        );
      }

      const token = authHeader.split(' ')[1];
      const payload = jwt.verify(token, process.env.JWT_SECRET) as any;

      req.user = {
        id: payload.sub,
        role: payload.role,
      };

      next();
    } catch (err) {
      next(new UnauthorizedException('Invalid token'));
    }
  }
}
