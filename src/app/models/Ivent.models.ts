export interface Ivent {
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    img: string;
    allDay: boolean;  // Agrega esta propiedad si es necesaria

  }
  

  export interface Notification {
    title: string;
    body?: string;
    icon?: string;
    timestamp: Date;
  }