export type GoalName = string;
export type ConditionDSL = string;

export type AskTransition = {
  name: string;
  target?: GoalName;
  conditions?: ConditionDSL;
  refusal_handler?: true;
  acknowledge?: string;
};

export type SayTransition = {
  name: string;
  target: GoalName;
  acknowledge?: string;
};

export type AskGoal = {
  name: GoalName;
  display_name?: string;
  goal_type: "ask" | "ask_generative"; // static = goal_type === 'ask'
  messages?: string | string[]; // array = take first item
  value_type: "approval" | "selection"; // approval = boolean, selection = enum
  choices?: { name: string }[]; // for selection
  transitions: AskTransition[];
};

export type SayGoal = {
  name: GoalName;
  display_name?: string;
  goal_type: "say" | "say_generative"; // static = goal_type === 'say'
  messages?: string | string[]; // array = take first item
  appended?: true; // omit to enable waitForResponse
  transitions: [SayTransition] | []; // always exactly one item
};

export type SubagentGoal = {
  name: GoalName;
  is_subagent: true;
  goal_type: "say_generative";
  messages?: string | string[];
  repeat: true;
  transitions: {
    name: string;
    prompt: string;
    target?: GoalName[];
  }[];
};

export type Goal = SayGoal | AskGoal | SubagentGoal;

export type Script = {
  goals: Goal[];
};
