import { Handle, type Position, useConnection } from "@xyflow/react";

type TargetHandleProps = {
  position: Position;
};

export function TargetHandle({ position }: TargetHandleProps) {
  const connection = useConnection();

  return (
    <>
      <Handle type="target" position={position} isConnectable={false} />

      {connection.inProgress && (
        <Handle
          type="target"
          position={position}
          className="absolute! inset-0! size-auto! transform-none! rounded-none! opacity-0"
        />
      )}
    </>
  );
}
