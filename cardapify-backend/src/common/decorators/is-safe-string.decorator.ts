import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsSafeString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isSafeString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }
          return !/[<>\"\'`]/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `Property ${args.property} contains forbidden characters (< > \" ' \`)`;
        },
      },
    });
  };
}
