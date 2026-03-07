import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { containsDangerousKeys } from '../utils/dangerous-keys.util';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'PATCH' && req.url.startsWith('/settings')) {
      const dangerous = containsDangerousKeys(req.body);
      if (dangerous) {
        this.logger.warn(`Dangerous key detected: ${dangerous} in settings update from IP: ${req.ip}`);
        return res.status(403).json({
          message: `Invalid key detected: ${dangerous}. This key is not allowed.`,
          error: 'Forbidden',
          statusCode: 403,
        });
      }
    }
    next();
  }
}
