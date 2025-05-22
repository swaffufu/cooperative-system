"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TrashIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { deleteMember } from "@/app/actions/members"
import { toast } from "@/components/ui/use-toast"

interface DeleteMemberDialogProps {
  memberId: number
  memberName: string
}

export function DeleteMemberDialog({ memberId, memberName }: DeleteMemberDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteMember(memberId)
      setIsOpen(false)
      toast({
        title: "Member deleted",
        description: `${memberName} has been deleted successfully.`,
      })
      router.push("/members")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {memberName}? This action cannot be undone and will also delete all
            associated transactions and nominee information.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
