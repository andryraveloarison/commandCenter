import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { DirectMessagesService } from './direct-messages.service';

class SendDmDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  contenu: string;
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
  getMessages(@Request() req, @Param('partnerId') partnerId: string) {
    return this.dmService.getMessages(req.user.id, partnerId);
  }

  @Post(':receiverId')
  sendMessage(@Request() req, @Param('receiverId') receiverId: string, @Body() dto: SendDmDto) {
    return this.dmService.sendMessage(req.user.id, receiverId, dto.contenu);
  }

  @Post(':partnerId/read')
  markAsRead(@Request() req, @Param('partnerId') partnerId: string) {
    return this.dmService.markAsRead(req.user.id, partnerId);
  }
}
