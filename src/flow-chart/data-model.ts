export type GoalName = string;
export type ConditionDSL = string;

export type AskTransition = {
  name?: string;
  target?: GoalName;
  conditions?: ConditionDSL;
  /** @deprecated */
  refusal_handler?: true;
  acknowledge?: string;
};

export type SayTransition = {
  name?: undefined;
  target: GoalName;
  acknowledge?: string;
};

export type AskGoal = {
  name: GoalName;
  display_name?: string;
  goal_type: "ask" | "ask_generative"; // static = goal_type === 'ask'
  messages?: string | string[]; // array = take first item
  value_type: "approval" | "selection" | "custom" | "number"; // approval = boolean, selection = enum, custom = string
  validation_prompt?: string;
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
  goal_type: "say_generative";
  messages?: string | string[];
  repeat: true;
  transitions: {
    name: string;
    prompt: string;
    target?: GoalName;
  }[];
};

export type Goal = SayGoal | AskGoal | SubagentGoal;

export type ScriptDefaultMetadata = {
  "%agent_name%"?: string;
  "%company_name%"?: string;
  "%call_intro%"?: string; // default "Hi, this is {%agent_name%} from {%company_name%}"
  "%inbound_welcome_message%"?: string; // default "Hello, this is {%agent_name%} from {%company_name%}."
  "%voicemail_message%"?: string; // default "Hi this is {%agent_name%} from {%company_name%}, please call me back at {%agent_phone_number%:local_phone:digits}"
  "%speaker_verification_acknowledge%"?: string; // default "Great!, Hi {contact_name}"
};

export type Script = {
  goals: Goal[];
  default_metadata?: ScriptDefaultMetadata;
};
