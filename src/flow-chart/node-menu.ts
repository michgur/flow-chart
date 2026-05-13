import {
  PhoneDisconnectIcon,
  PhonePlusIcon,
  QuestionMarkIcon,
  QuotesIcon,
  RobotIcon,
} from "@phosphor-icons/react";
import type { XYPosition } from "@xyflow/react";

import type { FlowNode } from "./flow-model";

type AddMenuEntry = {
  label: string;
  Icon: typeof QuotesIcon;
  createNode: (id: string, position: XYPosition) => FlowNode;
};

const addMenuByNodeType: Record<FlowNode["type"], AddMenuEntry | null> = {
  say: {
    label: "Say",
    Icon: QuotesIcon,
    createNode: (id, position) => ({
      id,
      type: "say",
      data: {
        name: "Say",
        static: true,
        prompt: "",
        waitForResponse: false,
      },
      position,
      selected: true,
    }),
  },
  ask: {
    label: "Ask",
    Icon: QuestionMarkIcon,
    createNode: (id, position) => ({
      id,
      type: "ask",
      data: {
        name: "Ask",
        static: true,
        prompt: "",
        field: {
          name: "answer",
          type: "boolean",
        },
        exits: [{ name: "", conditions: "" }],
        tools: [],
      },
      position,
      selected: true,
    }),
  },
  subagent: {
    label: "Subagent",
    Icon: RobotIcon,
    createNode: (id, position) => ({
      id,
      type: "subagent",
      data: {
        name: "Subagent",
        prompt: "",
        exits: [{ name: "Done", prompt: "" }],
        tools: [],
      },
      position,
      selected: true,
    }),
  },
  newcall: {
    label: "Add Call",
    Icon: PhonePlusIcon,
    createNode: (id, position) => ({
      id,
      type: "newcall",
      data: {
        name: "Add Call",
        static: true,
        prompt: "",
        agent: "",
        phoneNumber: "",
        preMergeMessage: undefined,
        parentFailMessage: undefined,
        brief: undefined,
        idleMessages: [],
      },
      position,
      selected: true,
    }),
  },
  hangup: {
    label: "Hang Up",
    Icon: PhoneDisconnectIcon,
    createNode: (id, position) => ({
      id,
      type: "hangup",
      data: {
        name: "Hang Up",
        prompt: "",
        callResult: undefined,
      },
      position,
      selected: true,
    }),
  },
  intro: null,
  "schedule-callback": null,
  goal: null,
  exit: null,
};

export const addNodeMenuOptions = (
  Object.entries(addMenuByNodeType) as [FlowNode["type"], AddMenuEntry | null][]
).flatMap(([nodeType, entry]) =>
  entry ? [{ nodeType, label: entry.label, Icon: entry.Icon }] : [],
);

export function createMenuNode(
  nodeType: FlowNode["type"],
  id: string,
  position: XYPosition,
): FlowNode | null {
  const entry = addMenuByNodeType[nodeType];
  if (entry === null) return null;
  return entry.createNode(id, position);
}
