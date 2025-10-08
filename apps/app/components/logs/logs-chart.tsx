'use client';

import type { ActivityLogEntry } from '@deepcrawl/types/routers/logs';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@deepcrawl/ui/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@deepcrawl/ui/components/ui/chart';
import { formatDate } from 'date-fns';
import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
} from 'recharts';
import { useLogsData } from '@/hooks/use-logs-data';
import { useLogsDateRange } from '@/hooks/use-logs-date-range';
import { useLogsFilters } from '@/hooks/use-logs-filters';
import {
  getDateRangeLabel,
  LogsDateRangeSelect,
} from './logs-date-range-select';

interface ChartDataPoint {
  date: string;
  requests: number;
  success: number;
  failed: number;
}

const chartConfig = {
  requests: {
    label: 'Total Requests',
    color: 'var(--foreground)',
  },
  success: {
    label: 'Successful',
    color: 'var(--foreground)',
  },
  failed: {
    label: 'Failed',
    color: 'var(--destructive)',
  },
} satisfies ChartConfig;

/**
 * Get the local date string (YYYY-MM-DD) from a timestamp
 */
function getLocalDateKey(timestamp: string): string {
  const date = new Date(timestamp);
  return formatDate(date, 'yyyy-MM-dd');
}

/**
 * Aggregate logs by date
 */
function aggregateLogsByDate(logs: ActivityLogEntry[]): ChartDataPoint[] {
  const aggregated = new Map<string, ChartDataPoint>();

  for (const log of logs) {
    const dateKey = getLocalDateKey(log.requestTimestamp);

    let point = aggregated.get(dateKey);
    if (!point) {
      point = {
        date: dateKey,
        requests: 0,
        success: 0,
        failed: 0,
      };
      aggregated.set(dateKey, point);
    }

    point.requests += 1;

    if (log.success) {
      point.success += 1;
    } else {
      point.failed += 1;
    }
  }

  // Sort by date
  return Array.from(aggregated.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

export function LogsChart() {
  const { activeRange } = useLogsDateRange();
  const { searchQuery, selectedStatuses, selectedPaths } = useLogsFilters();

  const { logs } = useLogsData({
    dateRange: activeRange,
    limit: 1000, // Get more data for chart aggregation
    offset: 0,
    orderBy: 'requestTimestamp',
    orderDir: 'desc',
    searchQuery,
    selectedStatuses,
    selectedPaths,
  });

  const chartData = useMemo(() => aggregateLogsByDate(logs), [logs]);

  const stats = useMemo(() => {
    const total = chartData.reduce((sum, point) => sum + point.requests, 0);
    const successful = chartData.reduce((sum, point) => sum + point.success, 0);
    const failed = chartData.reduce((sum, point) => sum + point.failed, 0);
    const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;

    return { total, successful, failed, successRate };
  }, [chartData]);

  return (
    <Card className="@container/card w-full">
      <CardHeader className="grid border-b">
        <CardTitle>Request Activity</CardTitle>
        <CardDescription>
          Daily request volume and success rate over time
        </CardDescription>
        <CardAction className="@md/card:mt-0 mt-2">
          <LogsDateRangeSelect className="w-fit" />
        </CardAction>
      </CardHeader>
      <CardContent className="px-2">
        <ChartContainer className="h-[200px] w-full" config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid horizontal={true} vertical={true} />
            {/* <XAxis
              axisLine={false}
              dataKey="date"
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
              tickLine={false}
              tickMargin={8}
            /> */}
            <XAxis
              axisLine={false}
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[180px]"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                  }}
                />
              }
            />
            {/* <Bar
              dataKey="success"
              fill="var(--foreground)"
              radius={[4, 4, 0, 0]}
              stackId="a"
            />
            <Bar
              dataKey="failed"
              fill="var(--destructive)"
              radius={[4, 4, 0, 0]}
              stackId="a"
            /> */}
            <Area
              dataKey="success"
              fill="var(--foreground)"
              fillOpacity={0.4}
              stroke="var(--foreground)"
              type="linear"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 border-t text-sm">
        {/* <div className="flex w-full items-center gap-2">
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-muted-foreground">Total Requests</span>
            <span className="font-bold text-2xl">
              {stats.total.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-muted-foreground">Success Rate</span>
            <span className="font-bold text-2xl">{stats.successRate}%</span>
          </div>
        </div> */}
        <div className="flex w-full items-center justify-between gap-2 text-sm">
          <div className="grid gap-1">
            <span className="text-muted-foreground">Success Rate</span>
            <div className="flex items-center gap-2 text-muted-foreground leading-none">
              {getDateRangeLabel(activeRange)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ChartContainer
              className="aspect-square size-[40px]"
              config={chartConfig}
            >
              <RadialBarChart
                data={[{ success: stats.successRate }]}
                endAngle={90 + stats.successRate * 3.6}
                innerRadius={17}
                outerRadius={25}
                startAngle={90}
              >
                <PolarGrid
                  gridType="circle"
                  polarRadius={[25, 17]}
                  radialLines={false}
                  stroke="none"
                />
                <RadialBar
                  background
                  cornerRadius={10}
                  dataKey="success"
                  fill="var(--color-green-600)"
                />
                <PolarRadiusAxis axisLine={false} tick={false} tickLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text
                            className="translate-y-[1px]"
                            dominantBaseline="middle"
                            textAnchor="middle"
                            x={viewBox.cx}
                            y={viewBox.cy}
                          >
                            <tspan
                              className="fill-muted-foreground font-bold text-xs"
                              x={viewBox.cx}
                              y={viewBox.cy}
                            >
                              {stats.successRate}
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </PolarRadiusAxis>
              </RadialBarChart>
            </ChartContainer>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
