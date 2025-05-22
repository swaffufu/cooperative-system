"use client"

import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getMembers } from "@/app/actions/members"
import { useQuery } from "@tanstack/react-query"

interface MembersListProps {
  searchQuery: string
  statusFilter: string
}

export function MembersList({ searchQuery, statusFilter }: MembersListProps) {
  const {
    data: members = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["members"],
    queryFn: getMembers,
  })

  // Filter members based on search query and status
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.member_no.includes(searchQuery) ||
      (member.national_id && member.national_id.includes(searchQuery))

    const matchesStatus = statusFilter === "all" || member.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return <div>Loading members...</div>
  }

  if (error) {
    return <div className="text-red-500">Error loading members: {error.message}</div>
  }

  return (
    <div className="mt-6 rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Member No.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>National ID</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Share Balance (RM)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMembers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No members found.
              </TableCell>
            </TableRow>
          ) : (
            filteredMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.member_no}</TableCell>
                <TableCell>
                  <Link href={`/members/${member.id}`} className="font-medium text-primary hover:underline">
                    {member.full_name}
                  </Link>
                </TableCell>
                <TableCell>{member.national_id || "-"}</TableCell>
                <TableCell>{member.join_date || "-"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      member.status === "active" ? "success" : member.status === "resigned" ? "warning" : "outline"
                    }
                  >
                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{member.total_balance.toFixed(2)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
