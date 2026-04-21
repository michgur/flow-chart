import type { Connection } from "@xyflow/react";
import type { Goal, GoalName, Script, Transition } from "./data-model";
import {
  createGoalName,
  isValidGoalName,
  sanitizeGoalNameInput,
} from "./goal-name";
import {
  GLOBAL_EDGE_PREFIX,
  GLOBAL_NODE_ID,
  GOAL_EDGE_PREFIX,
  GOAL_NODE_PREFIX,
  goalNodeId,
  parseGoalNodeId,
} from "./adapter";

type GoalTransitionRef = {
  kind: "goal";
  goalName: GoalName;
  transitionIndex: number;
};

type GlobalTransitionRef = {
  kind: "global";
  transitionIndex: number;
};

export type TransitionRef = GoalTransitionRef | GlobalTransitionRef;

export type TransitionRecord = {
  ref: TransitionRef;
  transition: Transition;
};

type TransitionValidationOptions = {
  excludingRef?: TransitionRef;
};

type TransitionConnection = Pick<Connection, "source" | "target">;

export function addGoal(script: Script, name: string): Script {
  const nextGoalName = sanitizeGoalNameInput(name);

  if (!isValidGoalName(nextGoalName)) {
    return script;
  }

  if (script.goals.some((goal) => goal.name === nextGoalName)) {
    return script;
  }

  return {
    ...script,
    goals: [...script.goals, { name: nextGoalName, transitions: [] }],
  };
}

export function addGoalAfter(
  script: Script,
  name: GoalName,
  after: GoalName,
): Script {
  const withGoal = addGoal(script, name);
  if (withGoal === script) return script;
  const withTransition = addTransition(withGoal, {
    source: goalNodeId(after),
    target: goalNodeId(name),
  });
  if (withTransition === withGoal) return script;
  return withTransition;
}

export function updateGoal(
  script: Script,
  currentGoalName: GoalName,
  nextGoal: Goal,
): Script {
  const normalizedNextName = sanitizeGoalNameInput(nextGoal.name);

  if (!isValidGoalName(normalizedNextName)) {
    return script;
  }

  if (!script.goals.some((goal) => goal.name === currentGoalName)) {
    return script;
  }

  if (
    normalizedNextName !== currentGoalName &&
    script.goals.some((goal) => goal.name === normalizedNextName)
  ) {
    return script;
  }

  let didChange = false;
  const didRenameGoal = normalizedNextName !== currentGoalName;
  const normalizedMessages = normalizeGoalMessages(nextGoal.messages);

  const goals = script.goals.map((goal) => {
    const transitions = didRenameGoal
      ? goal.transitions.map((transition) =>
          transition.target === currentGoalName
            ? {
                ...transition,
                target: normalizedNextName,
              }
            : transition,
        )
      : goal.transitions;
    const didTransitionsChange = transitions.some(
      (transition, index) => transition !== goal.transitions[index],
    );

    if (goal.name !== currentGoalName) {
      if (!didTransitionsChange) {
        return goal;
      }

      didChange = true;

      return {
        ...goal,
        transitions,
      };
    }

    const didNameChange = goal.name !== normalizedNextName;
    const didMessagesChange = goal.messages !== normalizedMessages;

    if (!didNameChange && !didMessagesChange && !didTransitionsChange) {
      return goal;
    }

    didChange = true;

    const nextGoalModel = {
      ...goal,
      name: normalizedNextName,
      transitions,
    };

    if (normalizedMessages === undefined) {
      const { messages: _messages, ...goalWithoutMessages } = nextGoalModel;
      return goalWithoutMessages;
    }

    return {
      ...nextGoalModel,
      messages: normalizedMessages,
    };
  });

  const transitions = didRenameGoal
    ? (script.transitions ?? []).map((transition) =>
        transition.target === currentGoalName
          ? {
              ...transition,
              target: normalizedNextName,
            }
          : transition,
      )
    : (script.transitions ?? []);

  if (didRenameGoal) {
    const didGlobalTransitionsChange = transitions.some(
      (transition, index) => transition !== (script.transitions ?? [])[index],
    );

    if (didGlobalTransitionsChange) {
      didChange = true;
    }
  }

  if (!didChange) {
    return script;
  }

  return {
    ...script,
    goals,
    transitions: transitions.length > 0 ? transitions : undefined,
  };
}

function normalizeGoalMessages(
  messages: string | undefined,
): string | undefined {
  return messages === "" ? undefined : messages;
}

export function removeGoals(script: Script, goalNames: GoalName[]): Script {
  const goalsToRemove = new Set(goalNames);

  if (goalsToRemove.size === 0) {
    return script;
  }

  if (!script.goals.some((goal) => goalsToRemove.has(goal.name))) {
    return script;
  }

  const goals = script.goals
    .filter((goal) => !goalsToRemove.has(goal.name))
    .map((goal) => {
      const transitions = goal.transitions.filter(
        (transition) => !goalsToRemove.has(transition.target),
      );

      if (transitions.length === goal.transitions.length) {
        return goal;
      }

      return {
        ...goal,
        transitions,
      };
    });

  const transitions = (script.transitions ?? []).filter(
    (transition) => !goalsToRemove.has(transition.target),
  );

  return {
    ...script,
    goals,
    transitions: transitions.length > 0 ? transitions : undefined,
  };
}

export function isValidTransition(
  script: Script,
  connection: TransitionConnection,
  options?: TransitionValidationOptions,
): boolean {
  const sourceNodeId = connection.source;
  const targetGoalName = parseGoalNodeId(connection.target);

  if (!sourceNodeId || !targetGoalName) {
    return false;
  }

  const goalNames = new Set(script.goals.map((goal) => goal.name));

  if (!goalNames.has(targetGoalName)) {
    return false;
  }

  const sourceGoalName = parseGoalNodeId(sourceNodeId);
  const isSourceValid =
    sourceNodeId === GLOBAL_NODE_ID ||
    (sourceGoalName !== null && goalNames.has(sourceGoalName));

  if (!isSourceValid) {
    return false;
  }

  return !hasTransitionInDirection(
    script,
    sourceNodeId,
    targetGoalName,
    options?.excludingRef,
  );
}

export function addTransition(
  script: Script,
  connection: TransitionConnection,
): Script {
  if (!isValidTransition(script, connection)) {
    return script;
  }

  const sourceNodeId = connection.source;
  const targetGoalName = parseGoalNodeId(connection.target);

  if (!sourceNodeId || !targetGoalName) {
    return script;
  }

  const transition: Transition = {
    name: "transition",
    target: targetGoalName,
    conditions: "",
  };

  if (sourceNodeId === GLOBAL_NODE_ID) {
    return {
      ...script,
      transitions: [...(script.transitions ?? []), transition],
    };
  }

  const sourceGoalName = parseGoalNodeId(sourceNodeId);

  if (!sourceGoalName) {
    return script;
  }

  const goals = script.goals.map((goal) => {
    if (goal.name !== sourceGoalName) {
      return goal;
    }

    return {
      ...goal,
      transitions: [...goal.transitions, transition],
    };
  });

  return {
    ...script,
    goals,
  };
}

export function findTransition(
  script: Script,
  edgeId: string,
): TransitionRecord | null {
  const globalTransitionIndex = parseGlobalEdgeId(edgeId);

  if (globalTransitionIndex !== null) {
    const transition = (script.transitions ?? [])[globalTransitionIndex];

    if (!transition) {
      return null;
    }

    return {
      ref: { kind: "global", transitionIndex: globalTransitionIndex },
      transition,
    };
  }

  const goalEdgeRef = parseGoalEdgeId(edgeId);

  if (!goalEdgeRef) {
    return null;
  }

  const sourceGoal = script.goals.find(
    (goal) => goal.name === goalEdgeRef.goalName,
  );

  if (!sourceGoal) {
    return null;
  }

  const transition = sourceGoal.transitions[goalEdgeRef.transitionIndex];

  if (!transition) {
    return null;
  }

  return {
    ref: {
      kind: "goal",
      goalName: sourceGoal.name,
      transitionIndex: goalEdgeRef.transitionIndex,
    },
    transition,
  };
}

export function updateTransition(
  script: Script,
  edgeId: string,
  transition: Transition,
): Script {
  const transitionRecord = findTransition(script, edgeId);

  if (!transitionRecord) {
    return script;
  }

  const transitionRef = transitionRecord.ref;
  const sourceNodeId =
    transitionRef.kind === "global"
      ? GLOBAL_NODE_ID
      : `${GOAL_NODE_PREFIX}${transitionRef.goalName}`;

  if (
    !isValidTransition(
      script,
      {
        source: sourceNodeId,
        target: `${GOAL_NODE_PREFIX}${transition.target}`,
      },
      { excludingRef: transitionRef },
    )
  ) {
    return script;
  }

  if (transitionRef.kind === "global") {
    const currentTransitions = script.transitions ?? [];

    if (!currentTransitions[transitionRef.transitionIndex]) {
      return script;
    }

    const nextTransitions = currentTransitions.map(
      (currentTransition, index) =>
        index === transitionRef.transitionIndex
          ? transition
          : currentTransition,
    );

    return {
      ...script,
      transitions: nextTransitions.length > 0 ? nextTransitions : undefined,
    };
  }

  const goals = script.goals.map((goal) => {
    if (goal.name !== transitionRef.goalName) {
      return goal;
    }

    if (!goal.transitions[transitionRef.transitionIndex]) {
      return goal;
    }

    const transitions = goal.transitions.map((currentTransition, index) =>
      index === transitionRef.transitionIndex ? transition : currentTransition,
    );

    return {
      ...goal,
      transitions,
    };
  });

  return {
    ...script,
    goals,
  };
}

export function reconnectTransition(
  script: Script,
  edgeId: string,
  nextConnection: TransitionConnection,
): Script {
  const transitionRecord = findTransition(script, edgeId);

  if (!transitionRecord) {
    return script;
  }

  if (
    !isValidTransition(script, nextConnection, {
      excludingRef: transitionRecord.ref,
    })
  ) {
    return script;
  }

  const sourceNodeId = nextConnection.source;
  const targetGoalName = parseGoalNodeId(nextConnection.target);

  if (!sourceNodeId || !targetGoalName) {
    return script;
  }

  const nextTransition = {
    ...transitionRecord.transition,
    target: targetGoalName,
  } satisfies Transition;

  const scriptWithoutTransition = removeTransitions(script, [edgeId]);

  if (sourceNodeId === GLOBAL_NODE_ID) {
    return {
      ...scriptWithoutTransition,
      transitions: [
        ...(scriptWithoutTransition.transitions ?? []),
        nextTransition,
      ],
    };
  }

  const sourceGoalName = parseGoalNodeId(sourceNodeId);

  if (!sourceGoalName) {
    return script;
  }

  if (
    !scriptWithoutTransition.goals.some((goal) => goal.name === sourceGoalName)
  ) {
    return script;
  }

  const goals = scriptWithoutTransition.goals.map((goal) => {
    if (goal.name !== sourceGoalName) {
      return goal;
    }

    return {
      ...goal,
      transitions: [...goal.transitions, nextTransition],
    };
  });

  return {
    ...scriptWithoutTransition,
    goals,
  };
}

export function removeTransitions(script: Script, edgeIds: string[]): Script {
  const { globalTransitionIndexes, goalTransitionIndexes } =
    parseTransitionIndexes(edgeIds);

  if (globalTransitionIndexes.size === 0 && goalTransitionIndexes.size === 0) {
    return script;
  }

  let didChangeGoals = false;

  const goals = script.goals.map((goal) => {
    const indexesToRemove = goalTransitionIndexes.get(goal.name);

    if (!indexesToRemove || indexesToRemove.size === 0) {
      return goal;
    }

    const transitions = goal.transitions.filter(
      (_, index) => !indexesToRemove.has(index),
    );

    if (transitions.length === goal.transitions.length) {
      return goal;
    }

    didChangeGoals = true;

    return {
      ...goal,
      transitions,
    };
  });

  const currentGlobalTransitions = script.transitions ?? [];
  const filteredGlobalTransitions = currentGlobalTransitions.filter(
    (_, index) => !globalTransitionIndexes.has(index),
  );
  const didChangeGlobalTransitions =
    filteredGlobalTransitions.length !== currentGlobalTransitions.length;

  if (!didChangeGoals && !didChangeGlobalTransitions) {
    return script;
  }

  return {
    ...script,
    goals,
    transitions:
      filteredGlobalTransitions.length > 0
        ? filteredGlobalTransitions
        : undefined,
  };
}

function parseTransitionIndexes(edgeIds: string[]): {
  globalTransitionIndexes: Set<number>;
  goalTransitionIndexes: Map<GoalName, Set<number>>;
} {
  const globalTransitionIndexes = new Set<number>();
  const goalTransitionIndexes = new Map<GoalName, Set<number>>();

  for (const edgeId of edgeIds) {
    const globalTransitionIndex = parseGlobalEdgeId(edgeId);

    if (globalTransitionIndex !== null) {
      globalTransitionIndexes.add(globalTransitionIndex);
      continue;
    }

    const goalEdgeRef = parseGoalEdgeId(edgeId);

    if (!goalEdgeRef) {
      continue;
    }

    const existingIndexes = goalTransitionIndexes.get(goalEdgeRef.goalName);

    if (existingIndexes) {
      existingIndexes.add(goalEdgeRef.transitionIndex);
      continue;
    }

    goalTransitionIndexes.set(
      goalEdgeRef.goalName,
      new Set([goalEdgeRef.transitionIndex]),
    );
  }

  return { globalTransitionIndexes, goalTransitionIndexes };
}

function hasTransitionInDirection(
  script: Script,
  sourceNodeId: string,
  targetGoalName: GoalName,
  excludingRef?: TransitionRef,
): boolean {
  if (sourceNodeId === GLOBAL_NODE_ID) {
    return (script.transitions ?? []).some((transition, index) => {
      if (
        excludingRef?.kind === "global" &&
        excludingRef.transitionIndex === index
      ) {
        return false;
      }

      return transition.target === targetGoalName;
    });
  }

  const sourceGoalName = parseGoalNodeId(sourceNodeId);

  if (!sourceGoalName) {
    return false;
  }

  const sourceGoal = script.goals.find((goal) => goal.name === sourceGoalName);

  if (!sourceGoal) {
    return false;
  }

  return sourceGoal.transitions.some((transition, index) => {
    if (
      excludingRef?.kind === "goal" &&
      excludingRef.goalName === sourceGoalName &&
      excludingRef.transitionIndex === index
    ) {
      return false;
    }

    return transition.target === targetGoalName;
  });
}

function parseGoalEdgeId(
  edgeId: string,
): { goalName: GoalName; transitionIndex: number } | null {
  if (!edgeId.startsWith(GOAL_EDGE_PREFIX)) {
    return null;
  }

  const serializedGoalRef = edgeId.slice(GOAL_EDGE_PREFIX.length);
  const separatorIndex = serializedGoalRef.lastIndexOf(":");

  if (separatorIndex <= 0) {
    return null;
  }

  const goalName = serializedGoalRef.slice(0, separatorIndex);
  const transitionIndex = Number.parseInt(
    serializedGoalRef.slice(separatorIndex + 1),
    10,
  );

  if (!Number.isInteger(transitionIndex) || transitionIndex < 0) {
    return null;
  }

  return { goalName, transitionIndex };
}

function parseGlobalEdgeId(edgeId: string): number | null {
  if (!edgeId.startsWith(GLOBAL_EDGE_PREFIX)) {
    return null;
  }

  const transitionIndex = Number.parseInt(
    edgeId.slice(GLOBAL_EDGE_PREFIX.length),
    10,
  );

  if (!Number.isInteger(transitionIndex) || transitionIndex < 0) {
    return null;
  }

  return transitionIndex;
}
