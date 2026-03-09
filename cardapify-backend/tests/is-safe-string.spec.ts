import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { IsSafeString } from '../src/common/decorators/is-safe-string.decorator';
import { IsString, IsNotEmpty } from 'class-validator';

class TestDto {
  @IsString()
  @IsNotEmpty()
  @IsSafeString()
  field!: string;
}

describe('IsSafeString Decorator', () => {
  it('should accept normal strings', async () => {
    const dto = plainToInstance(TestDto, {
      field: 'Hello World',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept strings with accents', async () => {
    const dto = plainToInstance(TestDto, {
      field: 'Restaurante São Paulo',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept strings with special characters', async () => {
    const dto = plainToInstance(TestDto, {
      field: 'Hambúrguer & Batata - R$ 25,00',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject HTML script tags', async () => {
    const dto = plainToInstance(TestDto, {
      field: '<script>alert("xss")</script>',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('field');
  });

  it('should reject HTML img tags', async () => {
    const dto = plainToInstance(TestDto, {
      field: '<img src=x onerror=alert(1)>',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject JavaScript protocol', async () => {
    const dto = plainToInstance(TestDto, {
      field: 'javascript:alert(1)',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject onerror handlers', async () => {
    const dto = plainToInstance(TestDto, {
      field: '<img src=x onerror=alert(1)>',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject SVG onload', async () => {
    const dto = plainToInstance(TestDto, {
      field: '<svg onload=alert(1)>',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject iframe', async () => {
    const dto = plainToInstance(TestDto, {
      field: '<iframe src="evil.com"></iframe>',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject nested quotes attempt', async () => {
    const dto = plainToInstance(TestDto, {
      field: 'test"onclick="alert(1)',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should accept Unicode characters', async () => {
    const dto = plainToInstance(TestDto, {
      field: '日本語中文한국어',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept emojis', async () => {
    const dto = plainToInstance(TestDto, {
      field: '🍔🍟🥤',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
