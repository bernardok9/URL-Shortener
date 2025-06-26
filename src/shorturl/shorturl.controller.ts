import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Req,
  Res,
  Patch,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ShorturlService } from './shorturl.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateShorturlDto } from './dto/create-shorturl.dto';
import { UpdateShorturlDto } from './dto/update-shorturl.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from 'src/auth/optional-jwt-auth.guard';
import { ShortUrl } from './shorturl.entity';
import { PaginatedShortUrlDto, PaginateDto } from './dto/shorturl.dto';

@ApiTags('short urls')
@Controller()
export class ShorturlController {
  constructor(private readonly shortUrlService: ShorturlService) { }

  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBody({ type: CreateShorturlDto })
  @ApiOperation({ summary: 'Short a url' })
  @ApiResponse({ status: 201, description: 'Url short success' })
  @Post('short')
  async short(@Body() body: CreateShorturlDto, @Req() req): Promise<ShortUrl> {
    return this.shortUrlService.create(body.url, req.user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all logged user urls' })
  @Get('url/list')
  async listUrl(@Req() req, @Query() query: PaginateDto) {
    return this.shortUrlService.list(req.user, query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Edit logged user url' })
  @Patch('url/:id')
  async updateUrl(@Param('id') id: string, @Req() req, @Body() body: UpdateShorturlDto): Promise<ShortUrl> {
    return this.shortUrlService.update(id, body.url, req.user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Soft delete user url' })
  @Delete('url/:id')
  async deleteUrl(@Param('id') id: string, @Req() req): Promise<string> {
    await this.shortUrlService.softDelete(id, req.user);
    return 'Delete successful';
  }

  @ApiOperation({ summary: 'Redirect to page using shortcode; Example: IsSj5A' })
  @ApiResponse({ status: 302, description: 'Redirect to original page' })
  @Get(':shortCode')
  async redirect(@Param('shortCode') shortCode: string, @Res() res: Response) {
    const found = await this.shortUrlService.findByCode(shortCode);
    return res.redirect(found.originalUrl);
  }
}
