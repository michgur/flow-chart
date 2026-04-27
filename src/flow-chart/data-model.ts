export type GoalName = string;
export type ConditionDSL = string;

export type Transition = {
  name: string;
  target: GoalName;
  conditions?: ConditionDSL;
  prompt?: string;
};

export type AskGoal = {
  name: GoalName;
  goal_type: "ask" | "ask_generative"; // static = goal_type === 'ask'
  messages?: string | string[]; // array = take first item
  value_type: "approval" | "selection"; // approval = boolean, selection = enum
  choices?: { name: string }[]; // for selection
  transitions: {
    name: string;
    target?: GoalName;
    conditions?: string; // selection: a choice name; approval: either "yes" or "no";
    refusal_handler?: true; // this makes the goal optional, and will be the "user refused" edge
  }[];
};

export type SayNode = {
  name: GoalName;
  goal_type: "say" | "say_generative"; // static = goal_type === 'say'
  messages?: string | string[]; // array = take first item
  transitions: [
    {
      name: string;
      target?: GoalName;
    },
  ]; // always exactly one item
};

export type Goal = {
  name: GoalName;
  nodeType: "say" | "ask" | "subagent";
  messages?: string;
  transitions?: Transition[];
};

export type Script = {
  goals: Goal[];
  transitions?: Transition[];
};
