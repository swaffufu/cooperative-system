"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getTransactions } from "@/app/actions/transactions"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

export function TransactionsList() {
  const {
    data: transactions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: getTransactions,
  })

  if (isLoading) {
    return <div>Loading transactions...</div>
  }

  if (error) {
    return <div className="text-red-500">Error loading transactions: {error.message}</div>
  }

  if (transactions.length === 0) {
    return <div className="py-4 text-center text-muted-foreground">No transactions found.</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Receipt No.</TableHead>
          <TableHead className="text-right">Amount In (RM)</TableHead>
          <TableHead className="text-right">Amount Out (RM)</TableHead>
          <TableHead className="text-right">Balance (RM)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>
              {transaction.member && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {transaction.member.full_name.split(" ")[0][0]}
                      {transaction.member.full_name.split(" ")[1]?.[0] || ""}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <Link href={`/members/${transaction.member.id}`} className="text-sm font-medium hover:underline">
                      {transaction.member.full_name}
                    </Link>
                    <span className="text-xs text-muted-foreground">{transaction.member.member_no}</span>
                  </div>
                </div>
              )}
            </TableCell>
            <TableCell>{transaction.transaction_date}</TableCell>
            <TableCell>{transaction.description || "-"}</TableCell>
            <TableCell>{transaction.receipt_no || "-"}</TableCell>
            <TableCell className="text-right">
              {transaction.amount_in > 0 ? transaction.amount_in.toFixed(2) : "-"}
            </TableCell>
            <TableCell className="text-right">
              {transaction.amount_out > 0 ? transaction.amount_out.toFixed(2) : "-"}
            </TableCell>
            <TableCell className="text-right font-medium">{transaction.total_balance.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
