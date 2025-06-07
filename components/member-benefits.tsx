"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, CheckCircleIcon } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { claimBenefit } from "@/app/actions/benefits"
import type { Benefit } from "@/lib/types"

interface MemberBenefitsProps {
  benefits: Benefit[]
  isLoading?: boolean
}

export function MemberBenefits({ benefits, isLoading = false }: MemberBenefitsProps) {
  const router = useRouter()
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false)
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClaimClick = (benefit: Benefit) => {
    setSelectedBenefit(benefit)
    setIsClaimDialogOpen(true)
  }

  const handleClaimConfirm = async () => {
    if (!selectedBenefit) return

    try {
      setIsSubmitting(true)
      await claimBenefit(selectedBenefit.id)
      router.refresh()
    } catch (error) {
      console.error("Error claiming benefit:", error)
    } finally {
      setIsSubmitting(false)
      setIsClaimDialogOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  if (benefits.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No benefits available</p>
  }

  return (
    <>
      <div className="space-y-4">
        {benefits.map((benefit) => (
          <div key={benefit.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">{benefit.benefit_type}</h4>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-lg font-semibold">RM {benefit.amount.toFixed(2)}</p>
                <Badge variant={benefit.status === "available" ? "outline" : "secondary"}>
                  {benefit.status === "available" ? "Available" : "Claimed"}
                </Badge>
              </div>
              {benefit.claimed_at && (
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <CalendarIcon className="h-3 w-3" />
                  <span>Claimed on {format(new Date(benefit.claimed_at), "dd MMM yyyy")}</span>
                </div>
              )}
            </div>
            {benefit.status === "available" && (
              <Button onClick={() => handleClaimClick(benefit)} size="sm">
                Claim
              </Button>
            )}
            {benefit.status === "claimed" && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
          </div>
        ))}
      </div>

      <AlertDialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Claim Benefit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to claim this benefit? This action cannot be undone.
              <div className="mt-2 p-3 border rounded-md">
                <p className="font-medium">{selectedBenefit?.benefit_type}</p>
                <p className="text-lg font-semibold">RM {selectedBenefit?.amount.toFixed(2)}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClaimConfirm} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Confirm Claim"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
