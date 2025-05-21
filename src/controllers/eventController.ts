import e, { Request, Response, NextFunction } from 'express';
import { EventInput } from '../types/Event';

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

export const createEvent =
  (eventModel: any) =>
  async (
    req: Request<{}, {}, EventInput>,
    res: Response,
    next: NextFunction
  ) => {
    const { title, description, location, price, start_time, end_time } =
      req.body;
    if (
      !title ||
      !description ||
      !location ||
      !price ||
      !start_time ||
      !end_time
    ) {
      return res.status(400).json({ message: 'Missing required event fields' });
    }
    try {
      const event = await eventModel.addEvent({
        title,
        description,
        location,
        price,
        start_time,
        end_time,
      });
      res.status(201).json(event);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: 'Error creating event', error: error.message });
    }
  };

export const updateEvent =
  (eventModel: any) =>
  async (
    req: Request<{ id: string }, {}, Partial<EventInput>>,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;
    const fields = req.body;

    if (!fields || Object.keys(fields).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    try {
      const updatedEvent = await eventModel.updateEvent(Number(id), fields);
      if (updatedEvent) {
        res.status(200).json(updatedEvent);
      } else {
        res.status(404).json({ message: 'Event not found' });
      }
    } catch (error: any) {
      res
        .status(500)
        .json({ message: 'Error updating event', error: error.message });
    }
  };

export const deleteEvent =
  (eventModel: any) =>
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const deleted = await eventModel.deleteEvent(Number(id));
      if (!deleted) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.status(204).send();
    } catch (error: any) {
      res
        .status(500)
        .json({ message: 'Error deleting event', error: error.message });
    }
  };
