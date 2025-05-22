"use client"

import { UsersIcon, WalletIcon, TrendingUpIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMembers } from "@/app/actions/members"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardStats() {
  const {
    data: members = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["members"],
    queryFn: getMembers,
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Error loading statistics: {(error as Error).message}</div>
  }

  // Calculate statistics
  const totalMembers = members.length
  const activeMembers = members.filter((member) => member.status === "active").length
  const totalShares = members.reduce((sum, member) => sum + (member.total_balance || 0), 0)

  // Calculate growth rate (mock data for now)
  const growthRate = ((totalShares / 100000) * 5).toFixed(1)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMembers}</div>
          <p className="text-xs text-muted-foreground">All registered members</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Members</CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeMembers}</div>
          <p className="text-xs text-muted-foreground">
            {totalMembers > 0 ? `${Math.round((activeMembers / totalMembers) * 100)}% of total members` : "No members"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
          <WalletIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">RM {totalShares.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Combined share value</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{growthRate}%</div>
          <p className="text-xs text-muted-foreground">Year-to-date growth</p>
        </CardContent>
      </Card>
    </div>
  )
}
