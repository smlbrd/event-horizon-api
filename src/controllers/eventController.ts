import { Request, Response, NextFunction } from 'express';

export const getEvents =
  (eventModel: any) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const events = await eventModel.getEvents();
      res.status(200).json(events);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: 'Error retrieving events', error: error.message });
    }
  };

export const getEventDetails =
  (eventModel: any) =>
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const event = await eventModel.getEventById(Number(id));
      if (event) {
        res.status(200).json(event);
      } else {
        res.status(404).json({ message: 'Event not found' });
      }
    } catch (error: any) {
      res
        .status(500)
        .json({ message: 'Error retrieving event', error: error.message });
    }
  };
