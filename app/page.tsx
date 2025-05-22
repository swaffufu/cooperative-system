import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlusIcon, WalletIcon } from "lucide-react"
import RecentTransactions from "@/components/recent-transactions"
import MemberStatusChart from "@/components/member-status-chart"
import ShareGrowthChart from "@/components/share-growth-chart"
import { DashboardStats } from "@/components/dashboard-stats"

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6 md:ml-64 pt-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your cooperative's performance and member statistics.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/members/new">
              <UserPlusIcon className="mr-2 h-4 w-4" />
              Add Member
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/transactions/new">
              <WalletIcon className="mr-2 h-4 w-4" />
              New Transaction
            </Link>
          </Button>
        </div>
      </div>

      <DashboardStats />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="members">Member Status</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Share Growth</CardTitle>
                <CardDescription>Total share value over the last 12 months</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ShareGrowthChart />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Member Status</CardTitle>
                <CardDescription>Distribution of member status</CardDescription>
              </CardHeader>
              <CardContent>
                <MemberStatusChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>The latest share transactions across all members</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentTransactions />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Member Status</CardTitle>
              <CardDescription>Overview of member status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <MemberStatusChart />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
