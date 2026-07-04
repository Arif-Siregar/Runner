import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

export default function DrawHistogram({ data, XAxisData, XAxisLabel, YAxisData, YAxisLabel}) {
  return (
    <div style={{ backgroundColor: "white", padding: "16px" }}>
        <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
            dataKey={XAxisData}
            angle={-45}
            textAnchor="end"
            label={{
                value: XAxisLabel,
                position: "insideBottom",
                offset: -50
            }}
            />

            <YAxis
            label={{
                value: YAxisLabel,
                angle: -90,
                position: "insideLeft"
            }}
            />

            <Tooltip />

            <Bar
            dataKey={YAxisData}
            radius={[4, 4, 0, 0]}
            />
        </BarChart>
        </ResponsiveContainer>
    </div>
  );
}