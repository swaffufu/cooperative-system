"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CheckIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { claimBenefit } from "@/app/actions/benefits"
import type { Benefit } from "@/lib/types"

interface MemberBenefitsProps {
  benefits: Benefit[]
}

export function MemberBenefits({ benefits }: MemberBenefitsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClaimClick = (benefit: Benefit) => {
    setSelectedBenefit(benefit)
    setIsDialogOpen(true)
  }

  const handleConfirmClaim = async () => {
    if (!selectedBenefit) return

    setIsSubmitting(true)
    try {
      await claimBenefit(selectedBenefit.id)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error claiming benefit:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (benefits.length === 0) {
    return <p className="text-muted-foreground">No benefits available.</p>
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b">
          <div className="col-span-4">Type</div>
          <div className="col-span-3">Amount</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-2">Action</div>
        </div>
        <div className="divide-y">
          {benefits.map((benefit) => (
            <div key={benefit.id} className="grid grid-cols-12 gap-4 p-4 items-center">
              <div className="col-span-4">{benefit.benefit_type}</div>
              <div className="col-span-3">RM {benefit.amount.toFixed(2)}</div>
              <div className="col-span-3">
                <Badge variant={benefit.status === "available" ? "outline" : "secondary"}>
                  {benefit.status === "available" ? "Available" : "Claimed"}
                  {benefit.claimed_at && ` (${format(new Date(benefit.claimed_at), "dd/MM/yyyy")})`}
                </Badge>
              </div>
              <div className="col-span-2">
                {benefit.status === "available" ? (
                  <Button size="sm" onClick={() => handleClaimClick(benefit)}>
                    Claim
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" disabled>
                    <CheckIcon className="h-4 w-4 mr-1" />
                    Claimed
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Claim Benefit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to claim this benefit? This action cannot be undone.
              <div className="mt-4 p-4 border rounded-md">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">Type:</div>
                  <div>{selectedBenefit?.benefit_type}</div>
                  <div className="font-medium">Amount:</div>
                  <div>RM {selectedBenefit?.amount.toFixed(2)}</div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClaim} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Confirm Claim"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
