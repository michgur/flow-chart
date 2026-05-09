export type GoalName = string;
export type ConditionDSL = string;

export type GoalStructuredMessage = {
  message: string;
};
export type GoalMessages = string | (GoalStructuredMessage | string)[];

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
  messages?: GoalMessages; // array = take first item
  value_type: "approval" | "selection" | "custom" | "number"; // approval = boolean, selection = enum, custom = string
  validation_prompt?: string;
  choices?: { name: string }[]; // for selection
  transitions: AskTransition[];
};

export type SayGoal = {
  name: GoalName;
  display_name?: string;
  goal_type: "say" | "say_generative"; // static = goal_type === 'say'
  messages?: GoalMessages; // array = take first item
  appended?: true; // omit to enable waitForResponse
  transitions: [SayTransition] | []; // always exactly one item
};

export type SubagentGoal = {
  name: GoalName;
  goal_type: "say_generative";
  messages?: GoalMessages;
  repeat: true;
  transitions: {
    name: string;
    prompt: string;
    target?: GoalName;
  }[];
};

export type NewCallGoal = {
  name: GoalName;
  goal_type: "say" | "say_generative";
  uninterruptible: true;
  messages?: GoalMessages;
  fulfillment: [
    {
      timing: "triggered_once";
      new_call: {
        agent: string;
        from_number: "{phone}";
        phone_number: string;
        pre_merge_message?: string; // e.g. "You are now connected.";
        parent_fail_message?: string; // e.g. "I'm sorry, but our team is currently busy. We'll have someone call you back shortly. Thank you!";
        contact_name: "{%company_name%}";
        check_dnc_registry: false;
        metadata: {
          client_contact_name: "{contact_name}";
          client_contact_full_name: "{contact_full_name}";
          client_phone: "{phone}";
          brief?: string;
        };
        idle_messages: { text: string; timeout: number }[];
      };
    },
    {
      timing: "performed";
      call_result: "converted";
    },
  ];
};

export type HangupGoal = {
  name: string;
  goal_type: "say";
  messages?: GoalMessages;
  fulfillment: [
    { timing: "performed"; voice_action: "hang_up"; call_result?: string },
  ];
};

export type Goal = SayGoal | AskGoal | SubagentGoal | NewCallGoal | HangupGoal;

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
