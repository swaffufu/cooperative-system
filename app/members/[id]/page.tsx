import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, EditIcon, FileTextIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getMemberById } from "@/app/actions/members"
import { getMemberBenefits } from "@/app/actions/benefits"
import { MemberTransactions } from "@/components/member-transactions"
import { MemberShareChart } from "@/components/member-share-chart"
import { MemberBenefits } from "@/components/member-benefits"
import { DeleteMemberDialog } from "@/components/delete-member-dialog"
import { Skeleton } from "@/components/ui/skeleton"

interface MemberDetailsPageProps {
  params: {
    id: string
  }
}

export default async function MemberDetailsPage({ params }: MemberDetailsPageProps) {
  const memberId = Number.parseInt(params.id)

  if (isNaN(memberId)) {
    return notFound()
  }

  return (
    <div className="flex flex-col gap-6 md:ml-64">
      <Suspense fallback={<MemberDetailsSkeleton />}>
        <MemberDetails memberId={memberId} />
      </Suspense>
    </div>
  )
}

async function MemberDetails({ memberId }: { memberId: number }) {
  let member
  let benefits

  try {
    member = await getMemberById(memberId)
    benefits = await getMemberBenefits(memberId)
  } catch (error) {
    return notFound()
  }

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/members">
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{member.full_name}</h1>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Member No: {member.member_no}</span>
              <Badge
                variant={member.status === "active" ? "success" : member.status === "resigned" ? "warning" : "outline"}
              >
                {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild>  
            <Link href={`/transactions/new?memberId=${member.id}`}>
              <PlusIcon className="mr-2 h-4 w-4" />
              New Transaction
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/members/${member.id}/edit`} 
              onClick={(e) => e.stopPropagation()}>
              <EditIcon className="mr-2 h-4 w-4" />
              Edit Member
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/members/${member.id}/statement`}>
              <FileTextIcon className="mr-2 h-4 w-4" />
              Generate Statement
            </Link>
          </Button>
          <DeleteMemberDialog memberId={member.id} memberName={member.full_name} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Member's personal and contact details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium">National ID</p>
                <p className="text-sm text-muted-foreground">{member.national_id || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Date of Birth</p>
                <p className="text-sm text-muted-foreground">{member.date_of_birth || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Permanent Address</p>
                <p className="text-sm text-muted-foreground">{member.permanent_address || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Mailing Address</p>
                <p className="text-sm text-muted-foreground">{member.mailing_address || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Phone Number</p>
                <p className="text-sm text-muted-foreground">{member.phone_number || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{member.email || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Occupation</p>
                <p className="text-sm text-muted-foreground">{member.occupation || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Join Date</p>
                <p className="text-sm text-muted-foreground">{member.join_date || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Approval Date</p>
                <p className="text-sm text-muted-foreground">{member.approval_date || "-"}</p>
              </div>
            </div>

            {(member.status_note || member.status_date) && (
              <div className="mt-4 rounded-lg border p-4">
                <h4 className="font-medium mb-2">Status Details</h4>
                {member.status_date && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {member.status === "resigned"
                        ? "Resignation Date"
                        : member.status === "deceased"
                          ? "Date of Death"
                          : "Status Date"}
                    </p>
                    <p className="text-sm text-muted-foreground">{member.status_date}</p>
                  </div>
                )}
                {member.status_note && (
                  <div className="space-y-1 mt-2">
                    <p className="text-sm font-medium">Notes</p>
                    <p className="text-sm text-muted-foreground">{member.status_note}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Share Balance</CardTitle>
            <CardDescription>Current share and bonus balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Share Balance</p>
                  <p className="text-lg font-bold">RM {member.share_balance.toFixed(2)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Bonus Balance</p>
                  <p className="text-lg font-bold">RM {member.bonus_balance.toFixed(2)}</p>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <p className="text-sm font-medium">Total Balance</p>
                  <p className="text-xl font-bold">RM {member.total_balance.toFixed(2)}</p>
                </div>
              </div>

              {member.nominee && (
                <div className="space-y-2 rounded-lg border p-4">
                  <h4 className="font-medium">Nominee Information</h4>
                  <div className="space-y-1">
                    <p className="text-sm">Name: {member.nominee.name}</p>
                    {member.nominee.relationship && (
                      <p className="text-sm">Relationship: {member.nominee.relationship}</p>
                    )}
                    {member.nominee.national_id && <p className="text-sm">National ID: {member.nominee.national_id}</p>}
                    {member.nominee.phone_number && <p className="text-sm">Phone: {member.nominee.phone_number}</p>}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="chart">Share Growth</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Complete history of member's share transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <MemberTransactions memberId={memberId} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>Share Growth</CardTitle>
              <CardDescription>Visual representation of member's share growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <MemberShareChart memberId={memberId} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="benefits">
          <Card>
            <CardHeader>
              <CardTitle>Member Benefits</CardTitle>
              <CardDescription>Available and claimed benefits</CardDescription>
            </CardHeader>
            <CardContent>
              <MemberBenefits benefits={benefits} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}

function MemberDetailsSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="mt-2 h-4 w-40" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-80 md:col-span-2" />
        <Skeleton className="h-80" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    </>
  )
}
