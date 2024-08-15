export interface Task {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  completed: boolean;
  category?: string;
  eventId?: string; // Hacer que category sea opcional y permita undefined
}
