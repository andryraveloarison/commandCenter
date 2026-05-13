import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsNotEmpty, MaxLength, IsArray, ArrayMinSize, IsNumber, Min } from 'class-validator';
import { ChatService } from './chat.service';

class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  contenu: string;
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

  @Post('poll')
  createPoll(@Body() dto: CreatePollDto, @Request() req) {
    return this.chatService.createPoll(req.user.id, dto.question, dto.options);
  }

  @Post('poll/:pollId/vote')
  votePoll(@Param('pollId') pollId: string, @Body() dto: VotePollDto, @Request() req) {
    return this.chatService.votePoll(pollId, req.user.id, dto.optionIndex);
  }
}
