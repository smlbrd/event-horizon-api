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
