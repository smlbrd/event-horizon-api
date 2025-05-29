import { Request, Response, NextFunction } from 'express';
import { eventModel } from '../models/eventModel';

export async function authEventAction(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { event_id } = req.params;
  const user = (req as any).user;

  try {
    const event = await eventModel.getEventById(event_id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const isCreator = user && event.created_by === user.userId;

    const isStaffOrAdmin =
      user && (user.role === 'staff' || user.role === 'admin');

    if (!isCreator && !isStaffOrAdmin) {
      return res.status(403).json({ message: 'Unauthorised' });
    }

    (req as any).event = event;
    next();
  } catch (error) {
    next(error);
  }
}
