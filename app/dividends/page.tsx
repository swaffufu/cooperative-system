"use client"

import { useState } from "react"
import Link from "next/link"
import { CalculatorIcon, PercentIcon, PlayIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { getMembers } from "@/app/actions/members"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"

export default function DividendsPage() {
  const [dividendRate, setDividendRate] = useState(3.0)
  const [cutoffDate, setCutoffDate] = useState<Date>(new Date())
  const [calculatedDividend, setCalculatedDividend] = useState<number | null>(null)

  const {
    data: members = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["members"],
    queryFn: getMembers,
  })

  const handleCalculate = () => {
    // Only include active members
    const activeMembers = members.filter((member) => member.status === "active")

    // Calculate total share value
    const totalShareValue = activeMembers.reduce((sum, member) => sum + member.share_balance, 0)

    // Calculate dividend amount
    const dividendAmount = (totalShareValue * dividendRate) / 100

    setCalculatedDividend(dividendAmount)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 md:ml-64">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6 md:ml-64">
        <div className="text-red-500">Error loading member data: {error.message}</div>
      </div>
    )
  }

  // Only include active members
  const activeMembers = members.filter((member) => member.status === "active")

  // Calculate total share value
  const totalShareValue = activeMembers.reduce((sum, member) => sum + member.share_balance, 0)

  return (
    <div className="flex flex-col gap-6 md:ml-64">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dividend Management</h1>
          <p className="text-muted-foreground">Calculate and distribute dividends to cooperative members.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calculate Dividends</CardTitle>
            <CardDescription>Set parameters for dividend calculation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="year">Financial Year</Label>
              <Input id="year" type="number" defaultValue={new Date().getFullYear()} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Dividend Rate (%)</Label>
              <Input
                id="rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={dividendRate}
                onChange={(e) => setDividendRate(Number.parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cutoffDate">Balance Cut-off Date</Label>
              <DatePicker date={cutoffDate} setDate={setCutoffDate} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setDividendRate(3.0)
                setCutoffDate(new Date())
                setCalculatedDividend(null)
              }}
            >
              Reset
            </Button>
            <Button onClick={handleCalculate}>
              <CalculatorIcon className="mr-2 h-4 w-4" />
              Calculate
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dividend Distribution</CardTitle>
            <CardDescription>Process and distribute calculated dividends.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-medium">Calculation Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Members:</span>
                  <span className="font-medium">{activeMembers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Share Value:</span>
                  <span className="font-medium">RM {totalShareValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Dividend Rate:</span>
                  <span className="font-medium">{dividendRate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Total Dividend Amount:</span>
                  <span className="font-bold">
                    RM{" "}
                    {calculatedDividend !== null
                      ? calculatedDividend.toFixed(2)
                      : ((totalShareValue * dividendRate) / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/reports">
                <PercentIcon className="mr-2 h-4 w-4" />
                View Report
              </Link>
            </Button>
            <Button disabled={calculatedDividend === null}>
              <PlayIcon className="mr-2 h-4 w-4" />
              Process Dividends
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
