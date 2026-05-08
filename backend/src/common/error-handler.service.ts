import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ErrorHandlerService {
  handlePrismaError(error: any) {
    if (error.code === 'P2002') {
      throw new ConflictException('Unique constraint violation');
    }
    if (error.code === 'P2025') {
      throw new NotFoundException('Record not found');
    }
    if (error.code === 'P2003') {
      throw new BadRequestException('Foreign key constraint violation');
    }
    throw error;
  }

  handleAuthError(message: string) {
    throw new UnauthorizedException(message);
  }

  handleNotFound(resource: string) {
    throw new NotFoundException(`${resource} not found`);
  }

  handleBadRequest(message: string) {
    throw new BadRequestException(message);
  }
}
