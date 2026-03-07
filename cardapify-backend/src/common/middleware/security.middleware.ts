import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];

function containsDangerousKeys(obj: unknown, path = ''): string | null {
  if (obj === null || typeof obj !== 'object') {
    return null;
  }

  for (const key of Object.keys(obj as object)) {
    if (DANGEROUS_KEYS.includes(key)) {
      return path + key;
    }
    const value = (obj as Record<string, unknown>)[key];
    if (typeof value === 'object' && value !== null) {
      const found = containsDangerousKeys(value, path + key + '.');
      if (found) {
        return found;
      }
    }
  }
  return null;
}

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'PATCH' && req.url.startsWith('/settings')) {
      const dangerous = containsDangerousKeys(req.body);
      if (dangerous) {
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
