import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: '5f0a4746-45a1-4057-ad4f-560507624d74',
    email: 'test@example.com',
    password: '123deoliveira4',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
  });

  describe('validateUser', () => {
    it('should return user without password if password is correct', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'flatworldlikeapizza');
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should throw if user not found', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(service.validateUser('notfound@email.com', '123456')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password does not match', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser('test@example.com', 'wrongpass')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signIn', () => {
    it('should return access token', async () => {
      jwtService.signAsync.mockResolvedValue('fake-jwt-token');
      const result = await service.signIn(mockUser);
      expect(result).toEqual({ access_token: 'fake-jwt-token' });
    });
  });

  describe('register', () => {
    it('should register and return user', async () => {
      const newUser = {
        email: 'new@example.com',
        password: 'flatworldlikeapizza',
      };

      const createdUser = {
        id: '39aefb2f-7526-4447-9581-b5de4d488e42',
        email: newUser.email,
        password: '123deoliveira4',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userService.create.mockResolvedValue(createdUser);
      const result = await userService.create(newUser as any);
      expect(result).toEqual(createdUser);
    });
  });
});
