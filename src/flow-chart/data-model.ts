export type GoalName = string;
export type ConditionDSL = string;

export type Transition = {
  name: string;
  target: GoalName;
  conditions?: ConditionDSL;
  prompt?: string;
};

export type Goal = {
  name: GoalName;
  messages?: string;
  transitions: Transition[];
};

export type Script = {
  goals: Goal[];
  transitions?: Transition[];
};
