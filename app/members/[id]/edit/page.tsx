"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditMemberDialog } from "@/components/edit-member-dialog"
import { getMemberById } from "@/app/actions/members"
import type { Member, Nominee } from "@/lib/types"

interface EditMemberPageProps {
  params: {
    id: string
  }
}

type MemberWithNominee = Member & { nominee: Nominee | null }

export default function EditMemberPage({ params }: EditMemberPageProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(true)
  const [member, setMember] = useState<MemberWithNominee | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const memberId = Number.parseInt(params.id)

  useEffect(() => {
    if (isNaN(memberId)) {
      router.push("/not-found")
      return
    }

    async function loadMember() {
      try {
        const memberData = await getMemberById(memberId)
        setMember(memberData)
      } catch (error) {
        console.error("Error loading member:", error)
        router.push("/not-found")
      } finally {
        setIsLoading(false)
      }
    }

    loadMember()
  }, [memberId, router])

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    router.push(`/members/${memberId}`)
  }

  if (isNaN(memberId)) {
    return null // This will be handled in useEffect
  }

  return (
    <div className="flex flex-col gap-6 md:ml-64">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/members/${memberId}`}>
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Member</h1>
      </div>

      {!isLoading && member && (
        <EditMemberDialog 
          member={member} 
          open={isDialogOpen} 
          onOpenChange={handleDialogClose} 
        />
      )}
    </div>
  )
}
