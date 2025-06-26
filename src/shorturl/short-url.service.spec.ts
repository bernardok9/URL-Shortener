import { Test, TestingModule } from '@nestjs/testing';
import { ShorturlService } from './shorturl.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShortUrl } from './shorturl.entity';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ShorturlService', () => {
  let service: ShorturlService;
  let repo: jest.Mocked<Repository<ShortUrl>>;

  const mockUser: User = { id: '9ab5b005-a105-443b-841b-da1f6d891bc3', email: 'test@example.com', password: '123deoliveira4', createdAt: new Date(), updatedAt: new Date() };
  const mockShortUrl: ShortUrl = {
    id: '41c294a5-7527-4737-a16a-f6ecec5a6aa9',
    originalUrl: 'https://example.com',
    shortCode: 'abc123',
    clicks: 0,
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const mockCounter = {
    inc: jest.fn(),
  };

  const mockHistogram = {
    startTimer: jest.fn().mockReturnValue(jest.fn()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShorturlService,
        {
          provide: getRepositoryToken(ShortUrl),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            softRemove: jest.fn(),
          },
        },
        {
          provide: 'PROM_METRIC_SHORTURL_CREATED_TOTAL',
          useValue: mockCounter,
        },
        {
          provide: 'PROM_METRIC_SHORTURL_EXECUTION_TIME',
          useValue: mockHistogram,
        },
      ],
    }).compile();

    service = module.get<ShorturlService>(ShorturlService);
    repo = module.get(getRepositoryToken(ShortUrl));
  });

  describe('shortCodeGenerator', () => {
    it('should generate a six chars short code', () => {
      const code = (service as any).shortCodeGenerator();
      expect(code).toMatch(/^[A-Za-z0-9]{6}$/);
    });
  })

  describe('create', () => {
    it('should create and save a short url', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue(mockShortUrl);
      repo.save.mockResolvedValue(mockShortUrl);

      const result = await service.create('https://example.com', mockUser);
      expect(result).toEqual(mockShortUrl);
      expect(repo.save).toHaveBeenCalledWith(mockShortUrl);
    });
  });

  describe('findByCode', () => {
    it('sholud return a url and increment click', async () => {
      repo.findOne.mockResolvedValue({ ...mockShortUrl });
      repo.save.mockResolvedValue({ ...mockShortUrl, clicks: 1 });

      const result = await service.findByCode('abc123');
      expect(result.clicks).toBe(1);
      expect(repo.save).toHaveBeenCalled();
    });

    it('should throw if not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findByCode('notfound')).rejects.toThrow(NotFoundException);
    });
  });

  describe('list', () => {
    it('should return urls for user', async () => {
      repo.find.mockResolvedValue([mockShortUrl]);
      const result = await service.list(mockUser);
      expect(result).toEqual([mockShortUrl]);
    });
  });

  describe('update', () => {
    it('should update and return url', async () => {
      repo.findOne.mockResolvedValue(mockShortUrl);
      repo.save.mockResolvedValue({ ...mockShortUrl, originalUrl: 'https://updated.com' });

      const result = await service.update('1', 'https://updated.com', mockUser);
      expect(result.originalUrl).toBe('https://updated.com');
    });

    it('should throw if not owner', async () => {
      repo.findOne.mockResolvedValue({
        ...mockShortUrl, user: {
          id: 'other',
          email: '',
          password: '',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      await expect(service.update('1', 'url', mockUser)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if short URL has no user', async () => {
      const user = { id: 'user-id' } as User;
      const id = 'url-id';

      repo.findOne = jest.fn().mockResolvedValue({ id, user: null });

      await expect(service.update(id, 'https://update.com', user)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('softDelete', () => {
    it('should use softRemove if user have the url', async () => {
      repo.findOne.mockResolvedValue(mockShortUrl);
      await service.softDelete('1', mockUser);
      expect(repo.softRemove).toHaveBeenCalledWith(mockShortUrl);
    });

    it('should throw if havent', async () => {
      repo.findOne.mockResolvedValue({
        ...mockShortUrl, user: {
          id: 'other',
          email: '',
          password: '',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      await expect(service.softDelete('1', mockUser)).rejects.toThrow(ForbiddenException);
    });
  });
});
