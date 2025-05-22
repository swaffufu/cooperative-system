import Link from "next/link"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Suspense } from "react"
import { TransactionsList } from "@/components/transactions-list"
import { Skeleton } from "@/components/ui/skeleton"

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-6 md:ml-64">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">View and manage all share transactions.</p>
        </div>
        <Button asChild>
          <Link href="/transactions/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Transaction
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View all share transactions across all members.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <TransactionsList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
