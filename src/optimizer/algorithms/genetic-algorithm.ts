// This file implements a genetic algorithm for optimizing study schedules
// It takes into account energy levels, task priorities, deadlines, and available time slots

export interface TimeSlot {
  day: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number; // in hours
  energyLevel: number; // 1-10
}

export interface StudyTask {
  id: string | number;
  title: string;
  estimatedHours: number;
  priority: number; // 1-5, where 5 is highest
  dueDate: Date;
  complexityLevel: string; // 'LOW', 'MEDIUM', 'HIGH'
  completed: boolean;
  subjectArea: string;
}

export interface StudyBlock {
  timeSlot: TimeSlot;
  task?: StudyTask;
  hoursAssigned: number;
}

export interface StudySchedule {
  blocks: StudyBlock[];
  fitness: number;
}

export class GeneticAlgorithm {
  private populationSize: number;
  private mutationRate: number;
  private crossoverRate: number;
  private elitismCount: number;
  private maxGenerations: number;
  private tasks: StudyTask[];
  private availableTimeSlots: TimeSlot[];

  constructor(
    tasks: StudyTask[],
    availableTimeSlots: TimeSlot[],
    options: {
      populationSize?: number;
      mutationRate?: number;
      crossoverRate?: number;
      elitismCount?: number;
      maxGenerations?: number;
    } = {}
  ) {
    this.tasks = tasks;
    this.availableTimeSlots = availableTimeSlots;
    this.populationSize = options.populationSize || 50;
    this.mutationRate = options.mutationRate || 0.1;
    this.crossoverRate = options.crossoverRate || 0.7;
    this.elitismCount = options.elitismCount || 5;
    this.maxGenerations = options.maxGenerations || 100;
  }

  // Initialize a random population of schedules
  private initializePopulation(): StudySchedule[] {
    const population: StudySchedule[] = [];

    for (let i = 0; i < this.populationSize; i++) {
      const schedule = this.createRandomSchedule();
      population.push(schedule);
    }

    return population;
  }

  // Create a random study schedule
  private createRandomSchedule(): StudySchedule {
    const blocks: StudyBlock[] = [];
    const remainingTaskHours = new Map<any, number>();

    // Initialize remaining hours for each task
    this.tasks.forEach((task) => {
      if (!task.completed) {
        remainingTaskHours.set(task.id, task.estimatedHours);
      }
    });

    // Randomly assign tasks to available time slots
    for (const timeSlot of this.shuffleArray([...this.availableTimeSlots])) {
      if (remainingTaskHours.size === 0) break;

      const availableTasks = [...remainingTaskHours.entries()]
        .filter(([taskId, hoursLeft]) => hoursLeft > 0)
        .map(([taskId]) => this.tasks.find((t) => t.id === taskId))
        .filter((task) => task); // Filter out undefined tasks

      if (availableTasks.length === 0) continue;

      // Randomly select a task for this time slot
      const randomIndex = Math.floor(Math.random() * availableTasks.length);
      const selectedTask = availableTasks[randomIndex];

      // Determine how many hours to assign
      const remainingHours = remainingTaskHours.get(selectedTask?.id);
      const hoursToAssign = Math.min(timeSlot.duration, remainingHours ?? 0);

      // Add the study block
      blocks.push({
        timeSlot,
        task: selectedTask,
        hoursAssigned: hoursToAssign,
      });

      // Update remaining hours
      const newRemainingHours = (remainingHours ?? 0) - hoursToAssign;
      if (newRemainingHours <= 0) {
        remainingTaskHours.delete(selectedTask?.id);
      } else {
        remainingTaskHours.set(selectedTask?.id, newRemainingHours);
      }
    }

    return {
      blocks,
      fitness: 0, // Will be calculated later
    };
  }

  // Helper method to shuffle an array
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Calculate fitness for a schedule
  private calculateFitness(schedule: StudySchedule): number {
    let fitness = 0;
    const taskCompletionPercentage = new Map<any, number>();
    const now = new Date();

    // Initialize task completion percentage
    this.tasks.forEach((task) => {
      if (!task.completed) {
        taskCompletionPercentage.set(task.id, 0);
      }
    });

    // Calculate total assigned hours for each task
    schedule.blocks.forEach((block) => {
      const taskId = block.task?.id || "";
      const task = this.tasks.find((t) => t.id === taskId);
      const currentPercentage = taskCompletionPercentage.get(taskId) || 0;
      const additionalPercentage = task ? (block.hoursAssigned / task?.estimatedHours) * 100 : 0;
      taskCompletionPercentage.set(taskId, currentPercentage + additionalPercentage);
    });

    // Calculate fitness components
    let completionScore = 0;
    let energyMatchScore = 0;
    let deadlineScore = 0;
    let priorityScore = 0;

    // Completion score: reward for completing tasks
    taskCompletionPercentage.forEach((percentage, taskId) => {
      completionScore += percentage / 100;
    });

    // Energy match score: reward for scheduling complex tasks during high energy periods
    schedule.blocks.forEach((block) => {
      const complexityFactor = block.task?.complexityLevel === "HIGH" ? 3 : block.task?.complexityLevel === "MEDIUM" ? 2 : 1;

      // Higher score when high complexity tasks are scheduled during high energy periods
      energyMatchScore += (block.timeSlot.energyLevel / 10) * complexityFactor;
    });

    // Deadline score: reward for completing tasks before deadlines
    this.tasks.forEach((task) => {
      if (task.completed) return;

      const daysUntilDue = Math.max(0, (task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const completionPercentage = taskCompletionPercentage.get(task.id) || 0;

      // Higher score for tasks that are completed early before deadline
      if (daysUntilDue <= 1) {
        // Urgent tasks (due within 24 hours)
        deadlineScore += (completionPercentage / 100) * 3;
      } else if (daysUntilDue <= 3) {
        // Soon tasks (due within 3 days)
        deadlineScore += (completionPercentage / 100) * 2;
      } else {
        // Less urgent tasks
        deadlineScore += completionPercentage / 100;
      }
    });

    // Priority score: reward for completing high priority tasks
    this.tasks.forEach((task) => {
      if (task.completed) return;

      const completionPercentage = taskCompletionPercentage.get(task.id) || 0;
      priorityScore += (completionPercentage / 100) * task.priority;
    });

    // Combine scores with weights
    fitness = completionScore * 0.3 + energyMatchScore * 0.25 + deadlineScore * 0.25 + priorityScore * 0.2;

    return fitness;
  }

  // Select individuals for breeding using tournament selection
  private selection(population: StudySchedule[]): StudySchedule[] {
    const tournamentSize = 3;
    const selected: StudySchedule[] = [];

    // Add elite schedules directly
    const sortedPopulation = [...population].sort((a, b) => b.fitness - a.fitness);
    for (let i = 0; i < this.elitismCount; i++) {
      selected.push(sortedPopulation[i]);
    }

    // Fill the rest with tournament selection
    while (selected.length < this.populationSize) {
      const tournament: StudySchedule[] = [];

      // Select random individuals for the tournament
      for (let i = 0; i < tournamentSize; i++) {
        const randomIndex = Math.floor(Math.random() * population.length);
        tournament.push(population[randomIndex]);
      }

      // Select the best individual from the tournament
      tournament.sort((a, b) => b.fitness - a.fitness);
      selected.push(tournament[0]);
    }

    return selected;
  }

  // Crossover two parent schedules to create offspring
  private crossover(parent1: StudySchedule, parent2: StudySchedule): StudySchedule {
    if (Math.random() > this.crossoverRate) {
      return { ...parent1 };
    }

    const childBlocks: StudyBlock[] = [];
    const usedTimeSlots = new Set<string>();
    const usedTaskHours = new Map<any, number>();

    // Initialize used task hours
    this.tasks.forEach((task) => {
      usedTaskHours.set(task.id, 0);
    });

    // Take blocks from both parents
    for (let i = 0; i < Math.max(parent1.blocks.length, parent2.blocks.length); i++) {
      const sourceParent = Math.random() < 0.5 ? parent1 : parent2;
      if (i < sourceParent.blocks.length) {
        const block = sourceParent.blocks[i];
        const timeSlotKey = `${block.timeSlot.day}-${block.timeSlot.startTime}-${block.timeSlot.endTime}`;

        // Skip if this time slot is already used or if task hours exceed estimated hours
        if (usedTimeSlots.has(timeSlotKey)) continue;

        const currentUsed = usedTaskHours.get(block.task?.id) || 0;
        const totalAfterBlock = currentUsed + block.hoursAssigned;
        if (block.task && totalAfterBlock > block.task?.estimatedHours) continue;

        // Add block to child
        childBlocks.push(block);
        usedTimeSlots.add(timeSlotKey);
        usedTaskHours.set(block.task?.id, totalAfterBlock);
      }
    }

    return {
      blocks: childBlocks,
      fitness: 0, // Will be calculated later
    };
  }

  // Mutate a schedule by randomly changing some blocks
  private mutate(schedule: StudySchedule): StudySchedule {
    if (Math.random() > this.mutationRate) {
      return schedule;
    }

    const mutatedBlocks = [...schedule.blocks];

    // Randomly select blocks to mutate
    for (let i = 0; i < mutatedBlocks.length; i++) {
      if (Math.random() < this.mutationRate) {
        // Choose a random mutation type
        const mutationType = Math.floor(Math.random() * 3);

        switch (mutationType) {
          case 0: // Change task
            const availableTasks = this.tasks.filter((t) => !t.completed);
            if (availableTasks.length > 0) {
              const randomTask = availableTasks[Math.floor(Math.random() * availableTasks.length)];
              mutatedBlocks[i] = {
                ...mutatedBlocks[i],
                task: randomTask,
                hoursAssigned: Math.min(mutatedBlocks[i].timeSlot.duration, randomTask.estimatedHours),
              };
            }
            break;

          case 1: // Change time slot
            const availableTimeSlots = this.availableTimeSlots.filter(
              (ts) =>
                !mutatedBlocks.some(
                  (block) => block !== mutatedBlocks[i] && block.timeSlot.day === ts.day && block.timeSlot.startTime === ts.startTime
                )
            );
            if (availableTimeSlots.length > 0) {
              const randomTimeSlot = availableTimeSlots[Math.floor(Math.random() * availableTimeSlots.length)];
              mutatedBlocks[i] = {
                ...mutatedBlocks[i],
                timeSlot: randomTimeSlot,
                hoursAssigned: Math.min(randomTimeSlot.duration, mutatedBlocks[i].task?.estimatedHours ?? 0),
              };
            }
            break;

          case 2: // Adjust hours
            const task = mutatedBlocks[i].task;
            const timeSlot = mutatedBlocks[i].timeSlot;
            const currentHours = mutatedBlocks[i].hoursAssigned;

            // Randomly increase or decrease hours
            let newHours = currentHours;
            if (Math.random() < 0.5 && currentHours > 0.5) {
              newHours = Math.max(0.5, currentHours - 0.5);
            } else if (task && currentHours < Math.min(timeSlot.duration, task.estimatedHours)) {
              newHours = Math.min(timeSlot.duration, task.estimatedHours, currentHours + 0.5);
            }

            mutatedBlocks[i] = {
              ...mutatedBlocks[i],
              hoursAssigned: newHours,
            };
            break;
        }
      }
    }

    return {
      blocks: mutatedBlocks,
      fitness: 0, // Will be calculated later
    };
  }

  // NEW METHOD: Validate and fix a schedule to ensure no task exceeds its estimated hours
  private validateSchedule(schedule: StudySchedule): StudySchedule {
    const taskHoursMap = new Map<any, number>();
    const validatedBlocks: StudyBlock[] = [];

    // First pass: calculate total hours assigned to each task
    schedule.blocks.forEach((block) => {
      const taskId = block.task?.id;
      if (taskId) {
        const currentHours = taskHoursMap.get(taskId) || 0;
        taskHoursMap.set(taskId, currentHours + block.hoursAssigned);
      }
    });

    // Second pass: adjust blocks if necessary to ensure estimated hours aren't exceeded
    schedule.blocks.forEach((block) => {
      const taskId = block.task?.id;
      if (!taskId) {
        validatedBlocks.push(block);
        return;
      }

      const task = this.tasks.find((t) => t.id === taskId);
      if (!task) {
        validatedBlocks.push(block);
        return;
      }

      const totalAssigned = taskHoursMap.get(taskId) || 0;

      if (totalAssigned > task.estimatedHours) {
        // Need to adjust this block's hours
        const excess = totalAssigned - task.estimatedHours;
        const adjustedHours = Math.max(0, block.hoursAssigned - excess);

        // Update the taskHoursMap for future blocks
        taskHoursMap.set(taskId, totalAssigned - (block.hoursAssigned - adjustedHours));

        validatedBlocks.push({
          ...block,
          hoursAssigned: adjustedHours,
        });
      } else {
        // No adjustment needed
        validatedBlocks.push(block);
      }
    });

    // Remove blocks with zero hours
    const filteredBlocks = validatedBlocks.filter((block) => block.hoursAssigned > 0);

    return {
      blocks: filteredBlocks,
      fitness: schedule.fitness,
    };
  }

  // Run the genetic algorithm to find an optimal schedule
  public optimize(): StudySchedule {
    let population = this.initializePopulation();
    console.log({ len: population.length });
    // Validate initial population
    population = population.map((schedule) => this.validateSchedule(schedule));

    // Calculate initial fitness
    population.forEach((schedule) => {
      schedule.fitness = this.calculateFitness(schedule);
    });

    // Evolution loop
    for (let generation = 0; generation < this.maxGenerations; generation++) {
      // Select parents
      const selected = this.selection(population);

      // Create next generation
      const nextGeneration: StudySchedule[] = [];

      // Elitism: keep the best schedules
      const elites = [...population].sort((a, b) => b.fitness - a.fitness).slice(0, this.elitismCount);

      nextGeneration.push(...elites);

      // Fill the rest with crossover and mutation
      while (nextGeneration.length < this.populationSize) {
        const parent1Index = Math.floor(Math.random() * selected.length);
        let parent2Index = Math.floor(Math.random() * selected.length);
        while (parent2Index === parent1Index) {
          parent2Index = Math.floor(Math.random() * selected.length);
        }

        const parent1 = selected[parent1Index];
        const parent2 = selected[parent2Index];

        // Crossover
        const offspring = this.crossover(parent1, parent2);

        // Mutation
        const mutatedOffspring = this.mutate(offspring);

        // Validate schedule to ensure no task exceeds its estimated hours
        const validatedOffspring = this.validateSchedule(mutatedOffspring);

        // Calculate fitness
        validatedOffspring.fitness = this.calculateFitness(validatedOffspring);

        nextGeneration.push(validatedOffspring);
      }

      // Update population
      population = nextGeneration;
    }

    // Find the best schedule
    const bestSchedule = population.sort((a, b) => b.fitness - a.fitness)[0];
    console.log({
      fitness0: population.sort((a, b) => b.fitness - a.fitness)[0].fitness,
      fitness1: population.sort((a, b) => b.fitness - a.fitness)[1].fitness,
      fitness2: population.sort((a, b) => b.fitness - a.fitness)[2].fitness,
      fitness3: population.sort((a, b) => b.fitness - a.fitness)[3].fitness,
    });

    // Final validation to ensure the best schedule is valid
    const validatedBestSchedule = this.validateSchedule(bestSchedule);
    validatedBestSchedule.fitness = this.calculateFitness(validatedBestSchedule);
    console.log({ validatedBestScheduleFitness: validatedBestSchedule.fitness });

    return validatedBestSchedule;
  }
}

// Collapse all methods and properties in a class.
// CTRL K + CTRL 0 => minimize all
