"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getTransactionsByMemberId } from "@/app/actions/transactions"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"

interface MemberTransactionsProps {
  memberId: number
}

export function MemberTransactions({ memberId }: MemberTransactionsProps) {
  const {
    data: transactions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["memberTransactions", memberId],
    queryFn: () => getTransactionsByMemberId(memberId),
  })

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  if (error) {
    return <div className="text-red-500">Error loading transactions: {error.message}</div>
  }

  if (transactions.length === 0) {
    return <div className="py-4 text-center text-muted-foreground">No transactions found for this member.</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Receipt No.</TableHead>
            <TableHead>Year</TableHead>
            <TableHead className="text-right">Amount In (RM)</TableHead>
            <TableHead className="text-right">Amount Out (RM)</TableHead>
            <TableHead className="text-right">Share Balance (RM)</TableHead>
            <TableHead className="text-right">Bonus Balance (RM)</TableHead>
            <TableHead className="text-right">Total Balance (RM)</TableHead>
            <TableHead>Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.transaction_date}</TableCell>
              <TableCell>{transaction.description || "-"}</TableCell>
              <TableCell>{transaction.receipt_no || "-"}</TableCell>
              <TableCell>{transaction.year || "-"}</TableCell>
              <TableCell className="text-right">
                {transaction.amount_in > 0 ? transaction.amount_in.toFixed(2) : "-"}
              </TableCell>
              <TableCell className="text-right">
                {transaction.amount_out > 0 ? transaction.amount_out.toFixed(2) : "-"}
              </TableCell>
              <TableCell className="text-right">{transaction.share_balance.toFixed(2)}</TableCell>
              <TableCell className="text-right">{transaction.bonus_balance.toFixed(2)}</TableCell>
              <TableCell className="text-right font-medium">{transaction.total_balance.toFixed(2)}</TableCell>
              <TableCell>{transaction.remarks || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
