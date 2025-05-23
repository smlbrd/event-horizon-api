import { Request, Response, NextFunction } from 'express';
import { EventInput } from '../types/Event';
import { EventModel } from '../types/EventModel';

export const getEvents =
  (eventModel: EventModel) =>
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
  (eventModel: EventModel) =>
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const event = await eventModel.getEventById(Number(id));
      res.status(200).json(event);
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      }
      res
        .status(500)
        .json({ message: 'Error retrieving event', error: error.message });
    }
  };

export const createEvent =
  (eventModel: EventModel) =>
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
      price === null ||
      price === undefined ||
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
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      }
      res
        .status(500)
        .json({ message: 'Error creating event', error: error.message });
    }
  };

export const updateEvent =
  (eventModel: EventModel) =>
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
      res.status(200).json(updatedEvent);
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      }
      res
        .status(500)
        .json({ message: 'Error updating event', error: error.message });
    }
  };

export const deleteEvent =
  (eventModel: EventModel) =>
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      await eventModel.deleteEvent(Number(id));
      res.status(204).send();
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      }
      res
        .status(500)
        .json({ message: 'Error deleting event', error: error.message });
    }
  };

export const addAttendee =
  (eventModel: EventModel) =>
  async (
    req: Request<{ id: string }, {}, { user_id: number; status: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const event_id = Number(req.params.id);
    const { user_id, status } = req.body;

    if (user_id === undefined || status === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const attendee = await eventModel.addAttendee({
        user_id,
        event_id,
        status,
      });
      res.status(201).json(attendee);
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      }
      res
        .status(500)
        .json({ message: 'Error adding attendee', error: error.message });
    }
  };
