export interface Task {
  id: string;
  title: string;
  description: string;
  startTime: string | Date;
  endTime: string | Date;
  completed: boolean;
}
