import {
  Controller, Get, Post, Body, Param, Query, Request,
  UseGuards, UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { IsString, IsNotEmpty, IsOptional, MaxLength, IsArray, ArrayMinSize, IsNumber, Min } from 'class-validator';
import { ChatService } from './chat.service';

class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  contenu: string;
}

class SendMediaDto {
  @IsString()
  @IsNotEmpty()
  type: 'IMAGE' | 'FILE';

  @IsString()
  @IsNotEmpty()
  contenu: string; // server-relative URL (/uploads/...) or legacy base64

  @IsString()
  @IsOptional()
  fileName?: string;
}

class CreatePollDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  question: string;

  @IsArray()
  @ArrayMinSize(2)
  options: string[];
}

class VotePollDto {
  @IsNumber()
  @Min(0)
  optionIndex: number;
}

const UPLOADS_DIR = join(process.cwd(), 'uploads');

const multerStorage = diskStorage({
  destination: (_req, _file, cb) => {
    if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${extname(file.originalname)}`);
  },
});

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get()
  findAll(@Query('limit') limit?: string, @Query('before') before?: string) {
    return this.chatService.findAll(limit ? parseInt(limit, 10) : 20, before);
  }

  @Get('count')
  getCount(@Request() req) {
    return this.chatService.getUnreadCount(req.user.id);
  }

  @Post('mark-read')
  markAsRead(@Request() req) {
    return this.chatService.markAsRead(req.user.id);
  }

  @Post()
  create(@Body() dto: SendMessageDto, @Request() req) {
    return this.chatService.create(req.user.id, dto.contenu);
  }

  @Post('media')
  sendMedia(@Body() dto: SendMediaDto, @Request() req) {
    return this.chatService.createMedia(req.user.id, dto.type, dto.contenu, dto.fileName);
  }

  @Post('poll')
  createPoll(@Body() dto: CreatePollDto, @Request() req) {
    return this.chatService.createPoll(req.user.id, dto.question, dto.options);
  }

  @Post('poll/:pollId/vote')
  votePoll(@Param('pollId') pollId: string, @Body() dto: VotePollDto, @Request() req) {
    return this.chatService.votePoll(pollId, req.user.id, dto.optionIndex);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: multerStorage, limits: { fileSize: 10 * 1024 * 1024 } }))
  uploadFile(@UploadedFile() file: { filename: string; originalname: string; mimetype: string; size: number }) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');
    return {
      url: `/uploads/${file.filename}`,
      fileName: file.originalname,
      mimeType: file.mimetype,
    };
  }
}
