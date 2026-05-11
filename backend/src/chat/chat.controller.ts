import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ChatService } from './chat.service';

class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  contenu: string;
}

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get()
  findAll() {
    return this.chatService.findAll();
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
}
