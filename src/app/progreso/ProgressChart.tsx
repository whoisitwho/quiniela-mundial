"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Player = { key: string; name: string; color: string };
type Datum = { x: number } & Record<string, number>;

export function ProgressChart({
  players,
  pointsData,
  rankData,
  labels,
  maxRank,
}: {
  players: Player[];
  pointsData: Datum[];
  rankData: Datum[];
  labels: string[];
  maxRank: number;
}) {
  const [mode, setMode] = useState<"points" | "rank">("points");
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const isRank = mode === "rank";
  const data = isRank ? rankData : pointsData;

  function toggle(key: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }
  const onlyOne = (key: string) =>
    setHidden(new Set(players.filter((p) => p.key !== key).map((p) => p.key)));
  const showAll = () => setHidden(new Set());

  return (
    <div className="space-y-3">
      {/* Selector de modo */}
      <div className="flex gap-2">
        <Toggle active={!isRank} onClick={() => setMode("points")}>
          Puntos acumulados
        </Toggle>
        <Toggle active={isRank} onClick={() => setMode("rank")}>
          Posición
        </Toggle>
      </div>

      <div className="rounded-2xl border border-line/40 bg-field/40 p-3">
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: -18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff14" />
            <XAxis
              dataKey="x"
              tick={{ fill: "#EAF2EC80", fontSize: 11 }}
              stroke="#ffffff20"
            />
            <YAxis
              tick={{ fill: "#EAF2EC80", fontSize: 11 }}
              stroke="#ffffff20"
              reversed={isRank}
              domain={isRank ? [1, maxRank] : [0, "auto"]}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "#0A1410",
                border: "1px solid #3A5C4A",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#FFB020" }}
              labelFormatter={(x) => labels[Number(x)] ?? `Partido ${x}`}
              formatter={(value, key) => {
                const p = players.find((pl) => pl.key === key);
                return [isRank ? `#${value}` : `${value} pts`, p?.name ?? key];
              }}
            />
            {players.map((p) => (
              <Line
                key={p.key}
                type="monotone"
                dataKey={p.key}
                stroke={p.color}
                strokeWidth={2}
                dot={false}
                hide={hidden.has(p.key)}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda interactiva */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-chalk/40">
          Toca un nombre para ocultarlo · doble toca para verlo solo
        </p>
        {hidden.size > 0 && (
          <button onClick={showAll} className="text-xs text-amber hover:underline">
            Ver todos
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {players.map((p) => {
          const off = hidden.has(p.key);
          return (
            <button
              key={p.key}
              onClick={() => toggle(p.key)}
              onDoubleClick={() => onlyOne(p.key)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${
                off
                  ? "border-line/30 text-chalk/30"
                  : "border-line/50 text-chalk/80"
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: off ? "#ffffff20" : p.color }}
              />
              {p.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-amber text-pitch"
          : "border border-line/50 text-chalk/70 hover:text-amber"
      }`}
    >
      {children}
    </button>
  );
}
