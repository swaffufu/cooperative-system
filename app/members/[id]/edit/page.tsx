"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditMemberDialog } from "@/components/edit-member-dialog"
import { getMemberById } from "@/app/actions/members"

interface EditMemberPageProps {
  params: {
    id: string
  }
}

export default function EditMemberPage({ params }: EditMemberPageProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(true)
  const memberId = Number.parseInt(params.id)

  if (isNaN(memberId)) {
    return notFound()
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    router.push(`/members/${memberId}`)
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

      <MemberEditorWrapper memberId={memberId} open={isDialogOpen} onOpenChange={handleDialogClose} />
    </div>
  )
}

async function MemberEditorWrapper({
  memberId,
  open,
  onOpenChange,
}: {
  memberId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  let member

  try {
    member = await getMemberById(memberId)
  } catch (error) {
    return notFound()
  }

  return <EditMemberDialog member={member} open={open} onOpenChange={onOpenChange} />
}
