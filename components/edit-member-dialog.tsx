"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { updateMember } from "@/app/actions/members"
import type { Member } from "@/lib/types"

interface EditMemberDialogProps {
  member: Member
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditMemberDialog({ member, open, onOpenChange }: EditMemberDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [title, setTitle] = useState(member.title)
  const [fullName, setFullName] = useState(member.full_name)
  const [nationalId, setNationalId] = useState(member.national_id)
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    member.date_of_birth ? new Date(member.date_of_birth) : undefined,
  )
  const [permanentAddress, setPermanentAddress] = useState(member.permanent_address || "")
  const [mailingAddress, setMailingAddress] = useState(member.mailing_address || "")
  const [phoneNumber, setPhoneNumber] = useState(member.phone_number || "")
  const [email, setEmail] = useState(member.email || "")
  const [occupation, setOccupation] = useState(member.occupation || "")
  const [status, setStatus] = useState<"active" | "resigned" | "deceased">(member.status)
  const [statusDate, setStatusDate] = useState<Date | undefined>(
    member.status_date ? new Date(member.status_date) : undefined,
  )
  const [statusNote, setStatusNote] = useState(member.status_note || "")

  // Nominee state
  const [nomineeName, setNomineeName] = useState(member.nominee?.name || "")
  const [nomineeRelationship, setNomineeRelationship] = useState(member.nominee?.relationship || "")
  const [nomineeId, setNomineeId] = useState(member.nominee?.national_id || "")
  const [nomineePhone, setNomineePhone] = useState(member.nominee?.phone_number || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("fullName", fullName)
      formData.append("nationalId", nationalId)
      formData.append("dateOfBirth", dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : "")
      formData.append("permanentAddress", permanentAddress)
      formData.append("mailingAddress", mailingAddress)
      formData.append("phoneNumber", phoneNumber)
      formData.append("email", email)
      formData.append("occupation", occupation)
      formData.append("status", status)
      formData.append("statusDate", statusDate ? format(statusDate, "yyyy-MM-dd") : "")
      formData.append("statusNote", statusNote)
      formData.append("nomineeName", nomineeName)
      formData.append("nomineeRelationship", nomineeRelationship)
      formData.append("nomineeId", nomineeId)
      formData.append("nomineePhone", nomineePhone)

      await updateMember(member.id, formData)
      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating member:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>Update member information. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Select value={title} onValueChange={setTitle}>
                <SelectTrigger id="title">
                  <SelectValue placeholder="Select title" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mr">Mr</SelectItem>
                  <SelectItem value="Mrs">Mrs</SelectItem>
                  <SelectItem value="Ms">Ms</SelectItem>
                  <SelectItem value="Dr">Dr</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationalId">National ID</Label>
              <Input id="nationalId" value={nationalId} onChange={(e) => setNationalId(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateOfBirth && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateOfBirth ? format(dateOfBirth, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dateOfBirth} onSelect={setDateOfBirth} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="permanentAddress">Permanent Address</Label>
              <Textarea
                id="permanentAddress"
                value={permanentAddress}
                onChange={(e) => setPermanentAddress(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="mailingAddress">Mailing Address</Label>
              <Textarea
                id="mailingAddress"
                value={mailingAddress}
                onChange={(e) => setMailingAddress(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input id="occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: "active" | "resigned" | "deceased") => setStatus(value)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="resigned">Resigned</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {status !== "active" && (
            <div className="space-y-4 border rounded-md p-4">
              <h3 className="font-medium">Status Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="statusDate">{status === "resigned" ? "Resignation Date" : "Date of Death"}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !statusDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {statusDate ? format(statusDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={statusDate} onSelect={setStatusDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="statusNote">Notes</Label>
                  <Textarea
                    id="statusNote"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 border rounded-md p-4">
            <h3 className="font-medium">Nominee Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomineeName">Name</Label>
                <Input id="nomineeName" value={nomineeName} onChange={(e) => setNomineeName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomineeRelationship">Relationship</Label>
                <Input
                  id="nomineeRelationship"
                  value={nomineeRelationship}
                  onChange={(e) => setNomineeRelationship(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomineeId">National ID</Label>
                <Input id="nomineeId" value={nomineeId} onChange={(e) => setNomineeId(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomineePhone">Phone Number</Label>
                <Input id="nomineePhone" value={nomineePhone} onChange={(e) => setNomineePhone(e.target.value)} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
