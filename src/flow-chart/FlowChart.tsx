import { useCallback, useRef, type Dispatch, type SetStateAction } from "react";
import {
  Background,
  BackgroundVariant,
  ControlButton,
  Controls,
  Panel,
  ReactFlow,
  type Connection,
  type IsValidConnection,
  type OnEdgesDelete,
  type OnNodesDelete,
  type OnReconnect,
  type ReactFlowInstance,
} from "@xyflow/react";
import type { Goal, GoalName, Script, Transition } from "./data-model";
import {
  goalNodeId,
  parseGoalNodeId,
  type FlowEdge,
  type FlowNode,
} from "./adapter";
import { createGoalName } from "./goal-name";
import { layoutNodes } from "./layout";
import {
  addGoalAfter,
  addTransition,
  isValidTransition,
  reconnectTransition,
  removeGoals,
  removeTransitions,
  updateGoal,
  updateTransition,
} from "./script-ops";
import { FlowInspector } from "./ui/FlowInspector";
import { GoalNode } from "./ui/GoalNode";
import "@xyflow/react/dist/style.css";
import { PaintBrushBroadIcon } from "@phosphor-icons/react/dist/ssr";
import { FlowContext } from "./flow-context";
import { useFlowGraph } from "./hooks/use-flow-graph";
import { useFlowSelection } from "./hooks/use-flow-selection";

export type FlowChartProps = {
  model: Script;
  onModelChange: Dispatch<SetStateAction<Script>>;
  className?: string;
};

export type FlowInstance = ReactFlowInstance<FlowNode, FlowEdge>;

export function FlowChart({ model, onModelChange, className }: FlowChartProps) {
  const flowRef = useRef<FlowInstance>(null);
  const { setNodes, nodes, edges, onNodesChange, onEdgesChange, onNodeRename } =
    useFlowGraph(model);
  const { selection, setSelection, onSelectionChange } =
    useFlowSelection(flowRef);

  const onCreateChildGoal = useCallback(
    (source: GoalName) => {
      let name: GoalName | undefined = undefined;
      onModelChange((prev) => {
        name = createGoalName(prev);
        return addGoalAfter(prev, name, source);
      });
      if (name) setSelection({ kind: "goal", goalName: name });
    },
    [onModelChange, setSelection],
  );

  const onAutoLayout = useCallback(() => {
    setNodes((nodes) => layoutNodes(nodes, edges));
    void flowRef.current?.fitView({ padding: 0.2, duration: 300 });
  }, [setNodes, edges]);

  const onInit = useCallback((instance: FlowInstance) => {
    flowRef.current = instance;
    onAutoLayout();
  }, []);

  const onConnect = useCallback(
    (connection: Connection) =>
      onModelChange((currentModel) => addTransition(currentModel, connection)),
    [onModelChange],
  );

  const isValidConnection = useCallback<IsValidConnection>(
    (connection) => isValidTransition(model, connection),
    [model],
  );

  const onEdgesDelete = useCallback<OnEdgesDelete>(
    (deletedEdges) =>
      onModelChange((prev) =>
        removeTransitions(
          prev,
          deletedEdges.map((edge) => edge.id),
        ),
      ),
    [onModelChange],
  );

  const onNodesDelete = useCallback<OnNodesDelete>(
    (deletedNodes) => {
      const goalNames = deletedNodes
        .map((node) => parseGoalNodeId(node.id))
        .filter((goalName): goalName is GoalName => goalName !== null);
      onModelChange((prev) => removeGoals(prev, goalNames));
    },
    [onModelChange],
  );

  const onReconnect = useCallback<OnReconnect>(
    (oldEdge, nextConnection) => {
      onModelChange((prev) =>
        reconnectTransition(prev, oldEdge.id, nextConnection),
      );
    },
    [onModelChange],
  );

  const onChangeGoal = useCallback(
    (goalName: GoalName, nextGoal: Goal) => {
      if (goalName !== nextGoal.name) {
        onNodeRename(goalNodeId(goalName), goalNodeId(nextGoal.name));
      }
      onModelChange((prev) => updateGoal(prev, goalName, nextGoal));
    },
    [model, onModelChange, onNodeRename, selection],
  );

  const onChangeTransition = useCallback(
    (edgeId: string, nextTransition: Transition) =>
      onModelChange((prev) => updateTransition(prev, edgeId, nextTransition)),
    [onModelChange],
  );

  const showInspector =
    selection?.kind === "goal" || selection?.kind === "transition";

  return (
    <FlowContext value={{ createGoal: onCreateChildGoal }}>
      <ReactFlow<FlowNode, FlowEdge>
        className={className}
        nodes={nodes}
        edges={edges}
        nodeTypes={{ goal: GoalNode }}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onEdgesDelete={onEdgesDelete}
        onNodesDelete={onNodesDelete}
        onReconnect={onReconnect}
        onSelectionChange={onSelectionChange}
        onInit={onInit}
        defaultEdgeOptions={{ animated: true }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} />
        <Controls>
          <ControlButton onClick={onAutoLayout} title="Auto tidy layout">
            <PaintBrushBroadIcon weight="bold" />
          </ControlButton>
        </Controls>
        {showInspector ? (
          <Panel
            position="top-right"
            className="inset-3! inset-s-auto! m-0! flex"
          >
            <FlowInspector
              model={model}
              selection={selection}
              onChangeGoal={onChangeGoal}
              onChangeTransition={onChangeTransition}
            />
          </Panel>
        ) : null}
      </ReactFlow>
    </FlowContext>
  );
}
