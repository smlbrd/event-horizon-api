export interface EventInput {
  title: string;
  description: string;
  location: string;
  price: number;
  start_time: string;
  end_time: string;
}

export interface Event extends EventInput {
  id: number;
}
