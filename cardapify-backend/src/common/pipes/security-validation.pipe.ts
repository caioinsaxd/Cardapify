import { Injectable, ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];

function containsDangerousKeys(obj: unknown, path = ''): string | null {
  if (obj === null || typeof obj !== 'object') {
    return null;
  }

  for (const key of Object.keys(obj)) {
    if (DANGEROUS_KEYS.includes(key)) {
      return path + key;
    }
    const value = (obj as Record<string, unknown>)[key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const found = containsDangerousKeys(value, path + key + '.');
      if (found) {
        return found;
      }
    }
  }
  return null;
}

@Injectable()
export class SecurityValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    const dangerousKey = containsDangerousKeys(value);
    if (dangerousKey) {
      throw new BadRequestException(
        `Invalid key detected: ${dangerousKey}. This key is not allowed for security reasons.`
      );
    }

    if (!value || typeof value !== 'object') {
      return value;
    }

    const { metatype } = metadata;
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = errors.map((err) => {
        const constraints = Object.values(err.constraints || {}).join(', ');
        return `${err.property}: ${constraints}`;
      });
      throw new BadRequestException(messages);
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
