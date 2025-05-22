"use client"

import { useState } from "react"
import Link from "next/link"
import { SearchIcon, UserPlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Suspense } from "react"
import { MembersList } from "@/components/members-list"
import { Skeleton } from "@/components/ui/skeleton"

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  return (
    <div className="flex flex-col gap-6 md:ml-64">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground">Manage and view all cooperative members.</p>
        </div>
        <Button asChild>
          <Link href="/members/new">
            <UserPlusIcon className="mr-2 h-4 w-4" />
            Add New Member
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Directory</CardTitle>
          <CardDescription>
            View and manage all cooperative members. Click on a member to see detailed information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <div className="relative w-full">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, ID or member number..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="resigned">Resigned</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Suspense fallback={<Skeleton className="mt-4 h-[400px] w-full" />}>
            <MembersList searchQuery={searchQuery} statusFilter={statusFilter} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
