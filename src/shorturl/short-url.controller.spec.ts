import { Test, TestingModule } from '@nestjs/testing';
import { ShorturlController } from './shorturl.controller';
import { ShorturlService } from './shorturl.service';
import { CreateShorturlDto } from './dto/create-shorturl.dto';
import { UpdateShorturlDto } from './dto/update-shorturl.dto';
import { Response } from 'express';

describe('ShorturlController', () => {
  let controller: ShorturlController;
  let service: ShorturlService;

  const mockService = {
    create: jest.fn(),
    findByCode: jest.fn(),
    list: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  const userMock = { id: '5f6f6330-25b8-45fb-b081-a3daf2466d5a' } as any;
  const shortUrlMock = {
    id: '84328d79-d9dc-4a2a-97f7-cb298eeebf3f',
    originalUrl: 'https://originalUrl.com',
    shortCode: 'abc123',
    clicks: 0,
    user: userMock,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShorturlController],
      providers: [
        {
          provide: ShorturlService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ShorturlController>(ShorturlController);
    service = module.get<ShorturlService>(ShorturlService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should short a url', async () => {
    const dto: CreateShorturlDto = { url: 'https://originalUrl.com' };
    mockService.create.mockResolvedValue(shortUrlMock);

    const result = await controller.short(dto, { user: userMock });

    expect(service.create).toHaveBeenCalledWith(dto.url, userMock);
    expect(result).toEqual(shortUrlMock);
  });

  it('should redirect to base url', async () => {
    mockService.findByCode.mockResolvedValue(shortUrlMock);

    const res = {
      redirect: jest.fn(),
    } as unknown as Response;

    await controller.redirect('abc123', res);
    expect(service.findByCode).toHaveBeenCalledWith('abc123');
    expect(res.redirect).toHaveBeenCalledWith('https://originalUrl.com');
  });

  it('should list all users urls', async () => {
    mockService.list.mockResolvedValue([shortUrlMock]);

    const result = await controller.listUrl({ user: userMock });

    expect(service.list).toHaveBeenCalledWith(userMock);
    expect(result).toEqual([shortUrlMock]);
  });

  it('should update user url', async () => {
    const dto: UpdateShorturlDto = { url: 'https://updated.com' };
    mockService.update.mockResolvedValue({ ...shortUrlMock, originalUrl: dto.url });

    const result = await controller.updateUrl('123', { user: userMock }, dto);

    expect(service.update).toHaveBeenCalledWith('123', dto.url, userMock);
    expect(result.originalUrl).toBe(dto.url);
  });

  it('should soft delete user url', async () => {
    mockService.softDelete.mockResolvedValue(undefined);

    const result = await controller.deleteUrl('123', { user: userMock });

    expect(service.softDelete).toHaveBeenCalledWith('123', userMock);
    expect(result).toBe('Delete successful');
  });
});
