import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/**
 * Blocks any request that tries to change the `role` field
 * unless the authenticated user is DSI.
 */
@Injectable()
export class DsiGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (req.body?.role !== undefined && req.user?.role !== 'DSI') {
      throw new ForbiddenException('Seul un DSI peut modifier les grades.');
    }
    return true;
  }
}
