
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from "../ui/card";
import { formatCurrency } from "@/utils/format";

interface ProjectionChartProps {
  chartData: Array<{ name: string; value: number }>;
  type: 'savings' | 'investments';
  projections: {
    twoWeeks: number;
    thirtyDays: number;
    sixMonths: number;
    oneYear: number;
    fiveYears: number;
  };
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-sm p-2 rounded shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export const ProjectionChart = ({ chartData, type, projections }: ProjectionChartProps) => {
  return (
    <Card className="p-4 bg-white/50 backdrop-blur-sm flex-1">
      <div className="h-32 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ right: 20, top: 10, bottom: 5 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={type === 'savings' ? '#4F46E5' : '#7C3AED'}
              strokeWidth={2}
              dot={(props: any) => {
                if (props.payload.name === '5y') {
                  return (
                    <>
                      <text
                        x={props.cx - 10}
                        y={props.cy}
                        dy={4}
                        fill={type === 'savings' ? '#4F46E5' : '#7C3AED'}
                        fontSize={12}
                        fontWeight="500"
                        textAnchor="end"
                      >
                        {formatCurrency(props.payload.value)}
                      </text>
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={4}
                        fill={type === 'savings' ? '#4F46E5' : '#7C3AED'}
                        stroke="white"
                        strokeWidth={2}
                      />
                    </>
                  );
                }
                return null;
              }}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              hide
              domain={['dataMin', 'dataMax']}
            />
            <Tooltip content={<CustomTooltip />} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <p className="text-sm font-medium text-gray-900 mb-2">Projected Balance:</p>
      <div className="space-y-1 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>2 Weeks:</span>
          <span className="font-medium">{formatCurrency(projections.twoWeeks)}</span>
        </div>
        <div className="flex justify-between">
          <span>30 Days:</span>
          <span className="font-medium">{formatCurrency(projections.thirtyDays)}</span>
        </div>
        <div className="flex justify-between">
          <span>6 Months:</span>
          <span className="font-medium">{formatCurrency(projections.sixMonths)}</span>
        </div>
        <div className="flex justify-between">
          <span>1 Year:</span>
          <span className="font-medium">{formatCurrency(projections.oneYear)}</span>
        </div>
        <div className="flex justify-between">
          <span>5 Years:</span>
          <span className="font-medium">{formatCurrency(projections.fiveYears)}</span>
        </div>
      </div>
    </Card>
  );
};
