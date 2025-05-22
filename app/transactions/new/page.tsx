"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, SaveIcon, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DatePicker } from "@/components/ui/date-picker"
import { Textarea } from "@/components/ui/textarea"
import { getMembers } from "@/app/actions/members"
import { createTransaction } from "@/app/actions/transactions"
import { useQuery } from "@tanstack/react-query"
import { toast } from "@/components/ui/use-toast"

export default function NewTransactionPage() {
  const searchParams = useSearchParams()
  const initialMemberId = searchParams.get("memberId")
  const router = useRouter()

  const [selectedMemberId, setSelectedMemberId] = useState(initialMemberId || "")
  const [transactionType, setTransactionType] = useState("deposit")
  const [transactionDate, setTransactionDate] = useState<Date>(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    data: members = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["members"],
    queryFn: getMembers,
  })

  // Find the selected member
  const selectedMember = members.find((member) => member.id.toString() === selectedMemberId)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!selectedMemberId) {
      toast({
        title: "Error",
        description: "Please select a member.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)

      // Add member ID to form data
      formData.set("memberId", selectedMemberId)

      // Add transaction date to form data
      if (transactionDate) {
        formData.set("transactionDate", transactionDate.toISOString().split("T")[0])
      }

      // Add transaction type to form data
      formData.set("transactionType", transactionType)

      await createTransaction(formData)

      toast({
        title: "Transaction created",
        description: "The transaction has been recorded successfully.",
      })

      // Redirect to member details or transactions page
      if (selectedMemberId) {
        router.push(`/members/${selectedMemberId}`)
      } else {
        router.push("/transactions")
      }
    } catch (error) {
      console.error("Error creating transaction:", error)
      toast({
        title: "Error",
        description: "Failed to create transaction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 md:ml-64">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={selectedMemberId ? `/members/${selectedMemberId}` : "/transactions"}>
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Transaction</h1>
          <p className="text-muted-foreground">Record a new share transaction for a member.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>Enter the details of the new transaction.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="memberSearch">Select Member</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                    <SelectTrigger id="memberSearch" className="pl-8">
                      <SelectValue placeholder="Search for a member..." />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.full_name} ({member.member_no})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedMemberId && (
                  <Button variant="outline" asChild>
                    <Link href={`/members/${selectedMemberId}`}>View Member</Link>
                  </Button>
                )}
              </div>
            </div>

            {selectedMember && (
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium">Member Information</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-muted-foreground">{selectedMember.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Member No.</p>
                    <p className="text-sm text-muted-foreground">{selectedMember.member_no}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">National ID</p>
                    <p className="text-sm text-muted-foreground">{selectedMember.national_id || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Current Balance</p>
                    <p className="text-sm font-bold">RM {selectedMember.total_balance.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <RadioGroup
                value={transactionType}
                onValueChange={setTransactionType}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="deposit" id="deposit" />
                  <Label htmlFor="deposit" className="font-normal">
                    Share Deposit (Wang Masuk)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="withdrawal" id="withdrawal" />
                  <Label htmlFor="withdrawal" className="font-normal">
                    Share Withdrawal (Wang Keluar)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dividend" id="dividend" />
                  <Label htmlFor="dividend" className="font-normal">
                    Dividend (Dividen)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fee" id="fee" />
                  <Label htmlFor="fee" className="font-normal">
                    Annual Fee (Yuran Tahunan)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="transactionDate">Transaction Date</Label>
                <DatePicker date={transactionDate} setDate={setTransactionDate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiptNo">Receipt No.</Label>
                <Input id="receiptNo" name="receiptNo" placeholder="Enter receipt number" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (RM)</Label>
                <Input id="amount" name="amount" type="number" min="0" step="0.01" placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select name="year">
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                    <SelectItem value="2020">2020</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="Enter transaction description" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea id="remarks" name="remarks" placeholder="Enter any additional remarks" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={selectedMemberId ? `/members/${selectedMemberId}` : "/transactions"}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={!selectedMemberId || isSubmitting}>
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Save Transaction
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
