export const STATUS_TEST = {
    NOT_STARTED: "not_started",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    FAILED: "failed",
} as const;

export const STATUS_GRAPH = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "running",
  COMPLETED: "completed",
  FAILED: "failed",
  INTERRUPTED: "interrupted",
} as const;


export type StatusTest = typeof STATUS_TEST[keyof typeof STATUS_TEST];

export type StatusGraph = typeof STATUS_GRAPH[keyof typeof STATUS_GRAPH];
