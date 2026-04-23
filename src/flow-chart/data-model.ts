export type GoalName = string;
export type ConditionDSL = string;

export type Transition = {
  name: string;
  target: GoalName;
  conditions?: ConditionDSL;
  prompt?: string;
};

export type Goal = {
  id: string;
  name: GoalName;
  messages?: string;
  transitions: Transition[];
};

export type GoalWithoutId = Omit<Goal, "id">;

export type Script = {
  goals: Goal[];
  transitions?: Transition[]; // 'global' transitions
};

export type ScriptWithoutGoalIds = Omit<Script, "goals"> & {
  goals: GoalWithoutId[];
};

export type TransitionId = {
  source: string | null; // null = global transition
  target: string;
};
