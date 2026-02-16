"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { getTransactionsLegacy } from "@/app/actions/transactions"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"

export default function ShareGrowthChart() {
  const {
    data: transactions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: getTransactionsLegacy,
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

  // Sort transactions by date
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime(),
  )

  // Group transactions by month
  const monthlyData: Record<string, { shares: number; bonus: number }> = {}

  // Get the last 12 months
  const today = new Date()
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const monthKey = date.toISOString().substring(0, 7) // YYYY-MM format
    monthlyData[monthKey] = { shares: 0, bonus: 0 }
  }

  // Find the last transaction for each month
  sortedTransactions.forEach((transaction) => {
    const monthKey = transaction.transaction_date.substring(0, 7) // YYYY-MM format
    if (monthlyData[monthKey] !== undefined) {
      monthlyData[monthKey] = {
        shares: transaction.share_balance,
        bonus: transaction.bonus_balance,
      }
    }
  })

  // Convert to array for chart
  const chartData = Object.entries(monthlyData).map(([month, data]) => ({
    month: new Date(month).toLocaleDateString(undefined, { month: "short" }),
    shares: data.shares,
    bonus: data.bonus,
    total: data.shares + data.bonus,
  }))

  return (
    <div className="h-[300px] w-full">
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
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => [`RM ${Number(value).toFixed(2)}`, "Amount"]} />
          <Legend />
          <Line type="monotone" dataKey="shares" stroke="#2563eb" activeDot={{ r: 8 }} name="Share Value" />
          <Line type="monotone" dataKey="bonus" stroke="#10b981" name="Bonus Value" />
          <Line type="monotone" dataKey="total" stroke="#f59e0b" name="Total Value" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
