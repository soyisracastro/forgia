export interface MovementCategory {
  name: string;
  movements: string[];
}

export const MOVEMENT_CATEGORIES: MovementCategory[] = [
  {
    name: 'Sentadillas',
    movements: ['Back Squat', 'Front Squat', 'Overhead Squat'],
  },
  {
    name: 'Peso Muerto',
    movements: ['Deadlift', 'Sumo Deadlift'],
  },
  {
    name: 'Press',
    movements: ['Strict Press', 'Push Press', 'Push Jerk', 'Bench Press'],
  },
  {
    name: 'Olímpicos',
    movements: ['Clean', 'Clean & Jerk', 'Snatch', 'Power Clean', 'Power Snatch', 'Hang Clean', 'Hang Snatch'],
  },
  {
    name: 'Gimnásticos',
    movements: ['Pull-up', 'Muscle-up (Bar)', 'Muscle-up (Ring)', 'Handstand Push-up', 'Rope Climb'],
  },
  {
    name: 'Otros',
    movements: ['Thruster', 'Wall Ball', 'Kettlebell Swing', 'Row (2k)', 'Run (1 mile)', 'Run (5k)'],
  },
];

export const ALL_MOVEMENTS: string[] = MOVEMENT_CATEGORIES.flatMap((c) => c.movements);
