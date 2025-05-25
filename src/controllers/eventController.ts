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
      const event = await eventModel.getEventById(Number(event_id));
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
      !end_time
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
      return next({ status: 400, message: 'No fields provided for update' });
    }

    try {
      const updatedEvent = await eventModel.updateEvent(
        Number(event_id),
        fields
      );
      res.status(200).json(updatedEvent);
    } catch (error) {
      next(error);
    }
  };

export const deleteEvent =
  (eventModel: EventModel) =>
  async (req: Request<EventParams>, res: Response, next: NextFunction) => {
    const { event_id } = req.params;
    try {
      await eventModel.deleteEvent(Number(event_id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

export const addAttendee =
  (eventModel: EventModel) =>
  async (
    req: Request<EventParams, {}, { user_id: number; status: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const event_id = Number(req.params.event_id);
    const { user_id, status } = req.body;

    if (user_id === undefined || status === undefined) {
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
    const event_id = Number(req.params.event_id);
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
    const user_id = Number(req.params.user_id);
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
    try {
      const attendee = await eventModel.updateAttendeeStatus(
        Number(event_id),
        Number(user_id),
        status
      );
      res.status(200).json(attendee);
    } catch (error) {
      next(error);
    }
  };
