import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto, LoginDto, RefreshTokenDto } from '../src/auth/dto/auth.dto';
import { CreateCategoryDto, UpdateCategoryDto } from '../src/category/dto/category.dto';
import { CreateProductDto, UpdateProductDto } from '../src/product/dto/product.dto';
import { CreateOrderDto, UpdateOrderStatusDto, OrderStatusEnum } from '../src/order/dto/order.dto';
import { UpdateSettingsDto, ApplyTemplateDto } from '../src/settings/dto/settings.dto';

describe('DTO Validation', () => {
  describe('Auth DTOs', () => {
    describe('RegisterDto', () => {
      it('should validate a valid register DTO', async () => {
        const dto = plainToInstance(RegisterDto, {
          email: 'test@restaurant.com',
          password: 'SecurePass123!',
          restaurantName: 'My Restaurant',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should reject invalid email', async () => {
        const dto = plainToInstance(RegisterDto, {
          email: 'invalid-email',
          password: 'SecurePass123!',
          restaurantName: 'My Restaurant',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('email');
      });

      it('should reject short password', async () => {
        const dto = plainToInstance(RegisterDto, {
          email: 'test@restaurant.com',
          password: 'short',
          restaurantName: 'My Restaurant',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('password');
      });

      it('should reject XSS in restaurantName', async () => {
        const dto = plainToInstance(RegisterDto, {
          email: 'test@restaurant.com',
          password: 'SecurePass123!',
          restaurantName: '<script>alert("xss")</script>',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('restaurantName');
      });

      it('should normalize email to lowercase', async () => {
        const dto = plainToInstance(RegisterDto, {
          email: 'TEST@RESTAURANT.COM',
          password: 'SecurePass123!',
          restaurantName: 'My Restaurant',
        });

        await validate(dto);
        expect(dto.email).toBe('test@restaurant.com');
      });
    });

    describe('LoginDto', () => {
      it('should validate a valid login DTO', async () => {
        const dto = plainToInstance(LoginDto, {
          email: 'test@restaurant.com',
          password: 'SecurePass123!',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should reject missing email', async () => {
        const dto = plainToInstance(LoginDto, {
          password: 'SecurePass123!',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });

      it('should reject missing password', async () => {
        const dto = plainToInstance(LoginDto, {
          email: 'test@restaurant.com',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    describe('RefreshTokenDto', () => {
      it('should validate a valid refresh token DTO', async () => {
        const dto = plainToInstance(RefreshTokenDto, {
          refreshToken: 'valid-token-string',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should reject empty refresh token', async () => {
        const dto = plainToInstance(RefreshTokenDto, {
          refreshToken: '',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Category DTOs', () => {
    describe('CreateCategoryDto', () => {
      it('should validate a valid category DTO', async () => {
        const dto = plainToInstance(CreateCategoryDto, {
          name: 'Burgers',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should reject empty name', async () => {
        const dto = plainToInstance(CreateCategoryDto, {
          name: '',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });

      it('should reject name exceeding max length', async () => {
        const dto = plainToInstance(CreateCategoryDto, {
          name: 'a'.repeat(101),
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });

      it('should reject XSS in name', async () => {
        const dto = plainToInstance(CreateCategoryDto, {
          name: '<img src=x onerror=alert(1)>',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    describe('UpdateCategoryDto', () => {
      it('should validate a valid update DTO', async () => {
        const dto = plainToInstance(UpdateCategoryDto, {
          name: 'Updated Burgers',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });
    });
  });

  describe('Product DTOs', () => {
    describe('CreateProductDto', () => {
      it('should validate a valid product DTO', async () => {
        const dto = plainToInstance(CreateProductDto, {
          name: 'Cheeseburger',
          description: 'Delicious beef patty with cheese',
          price: 15.99,
          categoryId: 'valid-uuid',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should reject negative price', async () => {
        const dto = plainToInstance(CreateProductDto, {
          name: 'Cheeseburger',
          price: -10,
          categoryId: 'valid-uuid',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });

      it('should reject missing categoryId', async () => {
        const dto = plainToInstance(CreateProductDto, {
          name: 'Cheeseburger',
          price: 15.99,
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });

      it('should reject invalid URL format', async () => {
        const dto = plainToInstance(CreateProductDto, {
          name: 'Cheeseburger',
          price: 15.99,
          categoryId: 'valid-uuid',
          imageUrl: 'not-a-valid-url',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });

      it('should accept valid HTTPS imageUrl', async () => {
        const dto = plainToInstance(CreateProductDto, {
          name: 'Cheeseburger',
          price: 15.99,
          categoryId: 'valid-uuid',
          imageUrl: 'https://example.com/image.jpg',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });
    });
  });

  describe('Order DTOs', () => {
    describe('CreateOrderDto', () => {
      it('should validate a valid order DTO', async () => {
        const dto = plainToInstance(CreateOrderDto, {
          tableNumber: 5,
          items: [
            { productId: 'valid-uuid', quantity: 2 },
          ],
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should reject zero table number', async () => {
        const dto = plainToInstance(CreateOrderDto, {
          tableNumber: 0,
          items: [{ productId: 'valid-uuid', quantity: 2 }],
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });

      it('should reject zero quantity', async () => {
        const dto = plainToInstance(CreateOrderDto, {
          tableNumber: 5,
          items: [{ productId: 'valid-uuid', quantity: 0 }],
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });

      it('should reject empty items array', async () => {
        const dto = plainToInstance(CreateOrderDto, {
          tableNumber: 5,
          items: [],
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    describe('UpdateOrderStatusDto', () => {
      it('should validate valid status', async () => {
        const dto = plainToInstance(UpdateOrderStatusDto, {
          status: OrderStatusEnum.PAID,
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should reject invalid status', async () => {
        const dto = plainToInstance(UpdateOrderStatusDto, {
          status: 'INVALID_STATUS',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });

      it('should accept all valid status values', async () => {
        const statuses = [
          OrderStatusEnum.PENDING,
          OrderStatusEnum.PAID,
          OrderStatusEnum.PREPARING,
          OrderStatusEnum.READY,
          OrderStatusEnum.COMPLETED,
          OrderStatusEnum.CANCELLED,
        ];

        for (const status of statuses) {
          const dto = plainToInstance(UpdateOrderStatusDto, { status });
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        }
      });
    });
  });

  describe('Settings DTOs', () => {
    describe('ApplyTemplateDto', () => {
      it('should validate a valid template DTO', async () => {
        const dto = plainToInstance(ApplyTemplateDto, {
          templateId: 'dark',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should reject empty templateId', async () => {
        const dto = plainToInstance(ApplyTemplateDto, {
          templateId: '',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    describe('UpdateSettingsDto', () => {
      it('should validate settings with valid hex colors', async () => {
        const dto = plainToInstance(UpdateSettingsDto, {
          theme: {
            primaryColor: '#FF6B35',
            backgroundColor: '#1A1A1A',
          },
          currency: 'BRL',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should reject XSS in theme colors', async () => {
        const dto = plainToInstance(UpdateSettingsDto, {
          theme: {
            primaryColor: '<script>alert(1)</script>',
          },
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });
});
