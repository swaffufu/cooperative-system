import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MemberStatusChart from "@/components/member-status-chart"
import ShareGrowthChart from "@/components/share-growth-chart"

export default function StatisticsPage() {
  return (
    <div className="flex flex-col gap-6 md:ml-64">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
        <p className="text-muted-foreground">Visual analytics and statistics for your cooperative.</p>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Member Statistics</TabsTrigger>
          <TabsTrigger value="shares">Share Statistics</TabsTrigger>
          <TabsTrigger value="transactions">Transaction Statistics</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Member Status Distribution</CardTitle>
              <CardDescription>Breakdown of members by their current status.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <MemberStatusChart />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="shares" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Share Growth Trend</CardTitle>
              <CardDescription>Total share value growth over the past 12 months.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ShareGrowthChart />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Volume</CardTitle>
              <CardDescription>Number and value of transactions by month.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[400px] items-center justify-center">
                <p className="text-muted-foreground">Transaction statistics will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
