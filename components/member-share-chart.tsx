"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { getTransactionsByMemberId } from "@/app/actions/transactions"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"

interface MemberShareChartProps {
  memberId: number
}

export function MemberShareChart({ memberId }: MemberShareChartProps) {
  const {
    data: transactions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["memberTransactions", memberId],
    queryFn: () => getTransactionsByMemberId(memberId),
  })

  if (isLoading) {
    return <Skeleton className="h-full w-full" />
  }

  if (error) {
    return <div className="text-red-500">Error loading transaction data: {error.message}</div>
  }

  if (transactions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">No transaction data available</div>
    )
  }

  // Format data for the chart
  const chartData = transactions.map((transaction) => ({
    date: transaction.transaction_date,
    shares: transaction.share_balance,
    bonus: transaction.bonus_balance,
    total: transaction.total_balance,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => [`RM ${Number(value).toFixed(2)}`, "Amount"]} />
        <Legend />
        <Line type="monotone" dataKey="shares" stroke="#2563eb" activeDot={{ r: 8 }} name="Share Value" />
        <Line type="monotone" dataKey="bonus" stroke="#10b981" name="Bonus Value" />
        <Line type="monotone" dataKey="total" stroke="#f59e0b" name="Total Value" />
      </LineChart>
    </ResponsiveContainer>
  )
}
