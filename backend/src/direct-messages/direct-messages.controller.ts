import { Controller, Get, Post, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { DirectMessagesService } from './direct-messages.service';

class SendDmDto {
  @IsString()
  @IsNotEmpty()
  contenu: string;

  @IsString()
  @IsOptional()
  type?: 'TEXT' | 'IMAGE' | 'FILE';

  @IsString()
  @IsOptional()
  fileName?: string;
}

@Controller('direct-messages')
@UseGuards(AuthGuard('jwt'))
export class DirectMessagesController {
  constructor(private dmService: DirectMessagesService) {}

  @Get()
  getConversations(@Request() req) {
    return this.dmService.getConversations(req.user.id);
  }

  @Get('unread-count')
  getUnreadCount(@Request() req) {
    return this.dmService.getUnreadCount(req.user.id);
  }

  @Get(':partnerId')
  getMessages(
    @Request() req,
    @Param('partnerId') partnerId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.dmService.getMessages(req.user.id, partnerId, limit ? parseInt(limit, 10) : 20, before);
  }

  @Post(':receiverId')
  sendMessage(@Request() req, @Param('receiverId') receiverId: string, @Body() dto: SendDmDto) {
    return this.dmService.sendMessage(req.user.id, receiverId, dto.contenu, dto.type ?? 'TEXT', dto.fileName);
  }

  @Post(':partnerId/read')
  markAsRead(@Request() req, @Param('partnerId') partnerId: string) {
    return this.dmService.markAsRead(req.user.id, partnerId);
  }
}
