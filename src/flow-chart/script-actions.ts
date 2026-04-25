import { generateGoalId } from "./script-adapter";
import type {
  Goal,
  GoalName,
  Script,
  ScriptWithoutGoalIds,
  Transition,
  TransitionId,
} from "./data-model";

export function getGoal(model: Script, goalId: string) {
  return model.goals.find((g) => g.id === goalId);
}

export function getTransition(model: Script, transitionId: TransitionId) {
  const target = getGoal(model, transitionId.target)?.name;
  if (target === undefined) return undefined;

  if (transitionId.source === null)
    return model.transitions?.find((t) => t.target === target);
  else
    return model.goals
      .find((g) => g.id === transitionId.source)
      ?.transitions.find((t) => t.target === target);
}

function mapGoalNameToId(model: Script) {
  return Object.fromEntries(model.goals.map((g) => [g.name, g.id]));
}

export function canAddTransition(
  model: Script,
  transitionId: TransitionId,
): boolean {
  if (transitionId.target === transitionId.source) return false;

  const target = getGoal(model, transitionId.target);
  if (!target) return false;

  if (transitionId.source === null) {
    return !!model.transitions?.every((t) => t.target !== target.name);
  } else {
    const source = getGoal(model, transitionId.source);
    return (
      !!source && source.transitions.every((t) => t.target !== target.name)
    );
  }
}

export function addTransition(
  model: Script,
  transitionId: TransitionId,
  options: Partial<Transition> = {},
): Script {
  const target = getGoal(model, transitionId.target);
  if (!target) return model;

  const transition: Transition = {
    name: "transition",
    conditions: "",
    ...options,
    target: target.name,
  };

  if (transitionId.source === null) {
    return {
      ...model,
      transitions: [...(model.transitions ?? []), transition],
    };
  }

  let didChange = false;
  const goals = model.goals.map((g) => {
    if (g.id !== transitionId.source) return g;
    didChange = true;
    return {
      ...g,
      transitions: [...g.transitions, transition],
    };
  });

  return didChange
    ? {
        ...model,
        goals,
      }
    : model;
}

export function changeTransitionTarget(
  model: Script,
  current: TransitionId,
  next: TransitionId,
): Script {
  const target = getGoal(model, current.target)?.name;
  if (!target) return model;

  const transition =
    current.source === null
      ? model.transitions?.find((t) => t.target === target)
      : model.goals
          .find((g) => g.id === current.source)
          ?.transitions.find((t) => t.target === target);
  if (!transition) return model;

  const nextModel = deleteGoalsAndTransitions(model, [], [current]);
  if (nextModel === model) return model;

  return addTransition(nextModel, next, transition);
}

export function deleteGoalsAndTransitions(
  model: Script,
  goalIds: string[],
  transitionIds: TransitionId[],
): Script {
  const nameToId = mapGoalNameToId(model);
  function deleteTransitions(
    transitions: Transition[],
    deletions: TransitionId[],
  ) {
    const targetIds = deletions.map(({ target }) => target).concat(goalIds);
    const filtered = transitions.filter(
      (t) => t.target in nameToId && !targetIds.includes(nameToId[t.target]),
    );
    return filtered.length < transitions.length ? filtered : transitions;
  }

  const transitions = model.transitions
    ? deleteTransitions(
        model.transitions,
        transitionIds.filter((d) => d.source === null),
      )
    : model.transitions;
  let didChange = transitions !== model.transitions;

  const goals = model.goals
    .filter((g) => {
      if (goalIds.includes(g.id)) {
        didChange = true;
        return false;
      } else return true;
    })
    .map((g) => {
      const t = deleteTransitions(
        g.transitions,
        transitionIds.filter((d) => d.source === g.id),
      );
      if (t === g.transitions) return g;

      didChange = true;
      return {
        ...g,
        transitions: t,
      };
    });

  return didChange
    ? {
        ...model,
        transitions,
        goals,
      }
    : model;
}

export function pruneGoalIds(script: Script): ScriptWithoutGoalIds {
  return {
    ...script,
    goals: script.goals.map((g) => {
      const { id: _, ...rest } = g;
      return rest;
    }),
  };
}

export function injectGoalIds(script: ScriptWithoutGoalIds): Script {
  return {
    ...script,
    goals: script.goals.map((goal) => ({
      ...goal,
      id: generateGoalId(),
    })),
  };
}

export function addGoalAfter(
  model: Script,
  after: string,
  options: Partial<Goal> = {},
): Script {
  const goal: Goal = {
    id: options.id ?? generateGoalId(),
    name: "",
    transitions: [],
    ...options,
  };
  const withGoal = {
    ...model,
    goals: [...model.goals, goal],
  };

  const withTransition = addTransition(withGoal, {
    source: after,
    target: goal.id,
  });
  return withTransition === withGoal ? model : withTransition;
}

export function updateGoal(
  model: Script,
  goalId: string,
  goal: Partial<Goal>,
): Script {
  const prev = getGoal(model, goalId);
  if (!prev) return model;

  if (prev.name !== goal.name && goal.name !== undefined) {
    model = renameTransitionsTarget(model, prev.name, goal.name);
  }
  return {
    ...model,
    goals: model.goals.map((g) =>
      g === prev ? { ...g, ...goal, id: goalId } : g,
    ),
  };
}

function renameTransitionsTarget(
  model: Script,
  from: GoalName,
  to: GoalName,
): Script {
  function update(transitions: Transition[]) {
    let didChange = false;
    const next = transitions.map((t) => {
      if (t.target !== from) return t;
      didChange = true;
      return { ...t, target: to };
    });
    return didChange ? next : transitions;
  }

  const transitions = model.transitions
    ? update(model.transitions)
    : model.transitions;
  let didChange = transitions !== model.transitions;
  const goals = model.goals.map((g) => {
    const t = update(g.transitions);
    if (g.transitions === t) return g;
    didChange = true;
    return {
      ...g,
      transitions: t,
    };
  });

  return didChange
    ? {
        ...model,
        goals,
        transitions,
      }
    : model;
}

export function updateTransition(
  model: Script,
  transitionId: TransitionId,
  transition: Partial<Transition>,
): Script {
  const target = getGoal(model, transitionId.target)?.name;
  if (target !== transition.target && transition.target !== undefined)
    return model;

  function update(transitions: Transition[]) {
    let didChange = false;
    const next = transitions.map((t) => {
      if (t.target !== target) return t;
      didChange = true;
      return { ...t, ...transition };
    });
    return didChange ? next : transitions;
  }

  if (transitionId.source === null) {
    if (!model.transitions) return model;
    const transitions = update(model.transitions);
    return transitions === model.transitions
      ? model
      : { ...model, transitions };
  }

  let didChange = false;
  const goals = model.goals.map((g) => {
    if (g.id !== transitionId.source) return g;
    const transitions = update(g.transitions);
    if (transitions === g.transitions) return g;
    didChange = true;
    return { ...g, transitions };
  });

  return didChange ? { ...model, goals } : model;
}
