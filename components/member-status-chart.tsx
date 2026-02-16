"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { getMembersLegacy } from "@/app/actions/members"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"

export default function MemberStatusChart() {
  const {
    data: members = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["members"],
    queryFn: getMembersLegacy,
  })

  if (isLoading) {
    return <Skeleton className="h-full w-full" />
  }

  if (error) {
    return <div className="text-red-500">Error loading member data: {error.message}</div>
  }

  // Count members by status
  const statusCounts = members.reduce(
    (acc, member) => {
      acc[member.status] = (acc[member.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Prepare data for chart
  const data = [
    { name: "Active", value: statusCounts.active || 0, color: "#10b981" },
    { name: "Resigned", value: statusCounts.resigned || 0, color: "#f59e0b" },
    { name: "Deceased", value: statusCounts.deceased || 0, color: "#6b7280" },
  ].filter((item) => item.value > 0)

  if (data.length === 0) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">No member data available</div>
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} members`, "Count"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
