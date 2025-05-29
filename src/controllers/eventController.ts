import { Request, Response, NextFunction } from 'express';
import {
  EventModel,
  EventInput,
  EventParams,
  UpdateAttendeeStatusBody,
} from '../types/event.types';

export const getEvents =
  (eventModel: EventModel) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const events = await eventModel.getEvents();
      res.status(200).json(events);
    } catch (error) {
      next(error);
    }
  };

export const getEventDetails =
  (eventModel: EventModel) =>
  async (req: Request<EventParams>, res: Response, next: NextFunction) => {
    const { event_id } = req.params;
    try {
      const event = await eventModel.getEventById(event_id);
      res.status(200).json(event);
    } catch (error) {
      next(error);
    }
  };

export const createEvent =
  (eventModel: EventModel) =>
  async (
    req: Request<{}, {}, EventInput>,
    res: Response,
    next: NextFunction
  ) => {
    const user = (req as any).user;

    if (!user || !user.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const created_by = user?.userId;

    const {
      title,
      description,
      location,
      price,
      start_time,
      end_time,
      image_url,
      image_alt_text,
    } = req.body;

    if (
      !title ||
      !description ||
      !location ||
      price === null ||
      price === undefined ||
      !start_time ||
      !end_time ||
      !created_by
    ) {
      return next({ status: 400, message: 'Missing required event fields' });
    }
    try {
      const event = await eventModel.addEvent({
        title,
        description,
        location,
        price,
        start_time,
        end_time,
        image_url,
        image_alt_text,
        created_by,
      });
      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  };

export const updateEvent =
  (eventModel: EventModel) =>
  async (
    req: Request<EventParams, {}, Partial<EventInput>>,
    res: Response,
    next: NextFunction
  ) => {
    const { event_id } = req.params;
    const fields = req.body;

    if (!fields || Object.keys(fields).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    let event;
    try {
      event = await eventModel.getEventById(event_id);
    } catch (error: any) {
      if (error.status === 404) {
        return res.status(404).json({ message: 'Event not found' });
      }
      return next(error);
    }

    const user = (req as any).user;
    const isCreator = user && event.created_by === user.userId;
    const isStaffOrAdmin =
      user && (user.role === 'staff' || user.role === 'admin');
    if (!isCreator && !isStaffOrAdmin) {
      return res.status(403).json({ message: 'Authentication required' });
    }

    try {
      const updatedEvent = await eventModel.updateEvent(event_id, fields);
      res.status(200).json(updatedEvent);
    } catch (error) {
      next(error);
    }
  };

export const deleteEvent =
  (eventModel: EventModel) =>
  async (req: Request<EventParams>, res: Response, next: NextFunction) => {
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
        return res.status(403).json({ message: 'Authentication required' });
      }

      await eventModel.deleteEvent(event_id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

export const addAttendee =
  (eventModel: EventModel) =>
  async (
    req: Request<EventParams, {}, { status: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const event_id = req.params.event_id;
    const { status } = req.body;
    const user = (req as any).user;

    if (!user || !user.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user_id = user.userId;

    if (status === undefined) {
      return next({ status: 400, message: 'Missing required fields' });
    }

    try {
      const attendee = await eventModel.addAttendee({
        user_id,
        event_id,
        status,
      });
      res.status(201).json(attendee);
    } catch (error) {
      next(error);
    }
  };

export const getAttendeesForEvent =
  (eventModel: EventModel) =>
  async (req: Request<EventParams>, res: Response, next: NextFunction) => {
    const event_id = req.params.event_id;
    try {
      const attendees = await eventModel.getAttendeesForEvent(event_id);
      res.status(200).json(attendees);
    } catch (error) {
      next(error);
    }
  };

export const getEventsForUser =
  (eventModel: EventModel) =>
  async (
    req: Request<{ user_id: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const user_id = req.params.user_id;
    try {
      const events = await eventModel.getEventsForUser(user_id);
      res.status(200).json(events);
    } catch (error) {
      next(error);
    }
  };

export const updateAttendeeStatus =
  (eventModel: EventModel) =>
  async (
    req: Request<
      { event_id: string; user_id: string },
      {},
      UpdateAttendeeStatusBody
    >,
    res: Response,
    next: NextFunction
  ) => {
    const { event_id, user_id } = req.params;
    const { status } = req.body;
    const user = (req as any).user;

    if (!user || !user.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (
      user.userId !== user_id &&
      user.role !== 'admin' &&
      user.role !== 'staff'
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: cannot update another user's status" });
    }

    try {
      const attendee = await eventModel.updateAttendeeStatus(
        event_id,
        user_id,
        status
      );
      res.status(200).json(attendee);
    } catch (error) {
      next(error);
    }
  };
