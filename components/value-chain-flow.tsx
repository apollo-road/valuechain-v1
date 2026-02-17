"use client";

import { useMemo } from "react";
import ReactFlow, { Background, Controls, MarkerType, Position } from "reactflow";
import "reactflow/dist/style.css";

type NodeData = {
  label: string;
  directCost: number;
  overhead: number;
  netMargin: number;
  marginPercent: number;
};

export function ValueChainFlow({
  activities,
}: {
  activities: { id: string; name: string; directCost: number; overhead: number; netMargin: number; marginPercent: number }[];
}) {
  const { nodes, edges } = useMemo(() => {
    const nodes = activities.map((a, index) => {
      const colorClass = a.marginPercent > 30 ? "#22c55e" : a.marginPercent < 15 ? "#ef4444" : "#3b82f6";
      return {
        id: a.id,
        position: { x: index * 320, y: 80 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: {
          width: 280,
          border: `1px solid ${colorClass}`,
          borderRadius: 12,
          boxShadow: `0 0 16px ${colorClass}66`,
          background: "#121a30",
          color: "#f8fafc",
          padding: 12,
        },
        data: {
          label: `${a.name}\nDirect: $${a.directCost.toFixed(0)}\nOverhead: $${a.overhead.toFixed(0)}\nNet: $${a.netMargin.toFixed(0)} (${a.marginPercent.toFixed(1)}%)`,
        } satisfies NodeData,
      };
    });

    const edges = activities.slice(0, -1).map((a, index) => ({
      id: `${a.id}-${activities[index + 1].id}`,
      source: a.id,
      target: activities[index + 1].id,
      markerEnd: { type: MarkerType.ArrowClosed },
      animated: true,
      style: { stroke: "#64748b" },
    }));

    return { nodes, edges };
  }, [activities]);

  return (
    <div className="h-[420px] rounded-xl border border-slate-800 bg-panel">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background color="#334155" />
        <Controls />
      </ReactFlow>
    </div>
  );
}
