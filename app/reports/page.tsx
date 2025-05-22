import Link from "next/link"
import { DownloadIcon, FileTextIcon, UsersIcon, WalletIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6 md:ml-64">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Generate and download various reports for your cooperative.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Member Directory</CardTitle>
            <CardDescription>Complete list of all members with their details.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-20 items-center justify-center">
              <UsersIcon className="h-10 w-10 text-muted-foreground" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="#">
                <DownloadIcon className="mr-2 h-4 w-4" />
                Generate Report
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Share Statement</CardTitle>
            <CardDescription>Detailed statement of share transactions for a specific period.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-20 items-center justify-center">
              <FileTextIcon className="h-10 w-10 text-muted-foreground" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="#">
                <DownloadIcon className="mr-2 h-4 w-4" />
                Generate Report
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Summary of all financial transactions and balances.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-20 items-center justify-center">
              <WalletIcon className="h-10 w-10 text-muted-foreground" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="#">
                <DownloadIcon className="mr-2 h-4 w-4" />
                Generate Report
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
