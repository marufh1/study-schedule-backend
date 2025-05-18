import {
  GeneticAlgorithm,
  StudySchedule,
  StudyTask,
  TimeSlot,
} from './genetic-algorithm';

export class ScheduleOptimizer {
  // Map day name to day of week (0-6, where 0 is Sunday)
  private static readonly DAY_MAP = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };

  // Convert time string to hours (e.g., "09:30" -> 9.5)
  private static timeToHours(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours + minutes / 60;
  }

  // Calculate duration between two times in hours
  private static calculateDuration(startTime: string, endTime: string): number {
    return this.timeToHours(endTime) - this.timeToHours(startTime);
  }

  // Optimize the study schedule
  public static optimizeSchedule(
    tasks: StudyTask[],
    workSchedules: Array<{
      day: string;
      startTime: string;
      endTime: string;
      date: Date;
    }>,
    classSchedules: Array<{
      day: string;
      startTime: string;
      endTime: string;
      date: Date;
    }>,
    energyLevels: Array<{
      day: string;
      timeSlot: string;
      level: number;
    }>,
    startDate: Date,
    endDate: Date,
  ): StudySchedule {
    // Generate all dates between start and end date
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Find available time slots (not occupied by work or classes)
    const availableTimeSlots: TimeSlot[] = [];

    // Define standard time slots for each day
    const standardTimeSlots = [
      { startTime: '06:00', endTime: '08:00' },
      { startTime: '08:00', endTime: '10:00' },
      { startTime: '10:00', endTime: '12:00' },
      { startTime: '12:00', endTime: '14:00' },
      { startTime: '14:00', endTime: '16:00' },
      { startTime: '16:00', endTime: '18:00' },
      { startTime: '18:00', endTime: '20:00' },
      { startTime: '20:00', endTime: '22:00' },
    ];

    // Process each date
    for (const date of dates) {
      const dayName = [
        'SUNDAY',
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
      ][date.getDay()];

      // Get work and class schedules for this day
      const workForDay = workSchedules.filter(
        (w) =>
          w.day === dayName ||
          (w.date && w.date.toDateString() === date.toDateString()),
      );
      const classesForDay = classSchedules.filter(
        (c) =>
          c.day === dayName ||
          (c.date && c.date.toDateString() === date.toDateString()),
      );

      // Get energy level for this day
      const energyForDay = energyLevels.filter((e) => e.day === dayName);

      // Check each standard time slot
      for (const slot of standardTimeSlots) {
        // Check if slot overlaps with any work or class schedule
        const isOverlapping =
          workForDay.some((work) =>
            this.isTimeOverlapping(
              slot.startTime,
              slot.endTime,
              work.startTime,
              work.endTime,
            ),
          ) ||
          classesForDay.some((cls) =>
            this.isTimeOverlapping(
              slot.startTime,
              slot.endTime,
              cls.startTime,
              cls.endTime,
            ),
          );

        if (!isOverlapping) {
          // Find energy level for this time slot
          let energyLevel = 5; // Default medium energy

          if (energyForDay.length > 0) {
            // Map time to time slot category
            const hour = this.timeToHours(slot.startTime);
            let timeSlotCategory: string;

            if (hour >= 5 && hour < 12) {
              timeSlotCategory = 'MORNING';
            } else if (hour >= 12 && hour < 17) {
              timeSlotCategory = 'AFTERNOON';
            } else if (hour >= 17 && hour < 21) {
              timeSlotCategory = 'EVENING';
            } else {
              timeSlotCategory = 'NIGHT';
            }

            // Find matching energy level
            const matchingEnergy = energyForDay.find(
              (e) => e.timeSlot === timeSlotCategory,
            );
            if (matchingEnergy) {
              energyLevel = matchingEnergy.level;
            }
          }

          // Add available time slot
          availableTimeSlots.push({
            day: dayName,
            date: new Date(date),
            startTime: slot.startTime,
            endTime: slot.endTime,
            duration: this.calculateDuration(slot.startTime, slot.endTime),
            energyLevel,
          });
        }
      }
    }

    // Use genetic algorithm to optimize the schedule
    const ga = new GeneticAlgorithm(tasks, availableTimeSlots);
    return ga.optimize();
  }

  // Check if two time ranges overlap
  private static isTimeOverlapping(
    start1: string,
    end1: string,
    start2: string,
    end2: string,
  ): boolean {
    const s1 = this.timeToHours(start1);
    const e1 = this.timeToHours(end1);
    const s2 = this.timeToHours(start2);
    const e2 = this.timeToHours(end2);

    return Math.max(s1, s2) < Math.min(e1, e2);
  }
}
