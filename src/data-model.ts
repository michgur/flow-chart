export type GoalName = string;
export type ConditionDSL = string;

export type Transition = {
  target: GoalName;
} & ({ conditions: ConditionDSL } | { conditions?: ConditionDSL; prompt: string });

export type Goal = {
  name: GoalName;
  transitions: Transition[];
};

export type Script = {
  goals: Goal[];
  transitions?: Transition[]; // 'global' transitions
};
