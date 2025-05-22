"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, SaveIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { createMember } from "@/app/actions/members"
import { toast } from "@/components/ui/use-toast"

export default function NewMemberPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dateOfBirth, setDateOfBirth] = useState<Date>()
  const [joinDate, setJoinDate] = useState<Date>(new Date())
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)

      // Add date values to form data
      if (dateOfBirth) {
        formData.set("dateOfBirth", dateOfBirth.toISOString().split("T")[0])
      }

      if (joinDate) {
        formData.set("joinDate", joinDate.toISOString().split("T")[0])
      }

      const member = await createMember(formData)

      toast({
        title: "Member created",
        description: "The new member has been created successfully.",
      })

      router.push(`/members/${member.id}`)
    } catch (error) {
      console.error("Error creating member:", error)
      toast({
        title: "Error",
        description: "Failed to create member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 md:ml-64">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/members">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Member</h1>
          <p className="text-muted-foreground">Register a new cooperative member.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Member Information</CardTitle>
            <CardDescription>Enter the new member's personal and contact information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="memberNo">Member No.</Label>
                <Input id="memberNo" name="memberNo" placeholder="Enter member number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Select name="title">
                  <SelectTrigger id="title">
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENCIK">ENCIK</SelectItem>
                    <SelectItem value="PUAN">PUAN</SelectItem>
                    <SelectItem value="CIK">CIK</SelectItem>
                    <SelectItem value="TUAN">TUAN</SelectItem>
                    <SelectItem value="DR">DR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" placeholder="Enter full name" required />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nationalId">National ID No.</Label>
                <Input id="nationalId" name="nationalId" placeholder="e.g., 740402-04-5265" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <DatePicker date={dateOfBirth} setDate={setDateOfBirth} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="permanentAddress">Permanent Address</Label>
              <Textarea id="permanentAddress" name="permanentAddress" placeholder="Enter permanent address" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mailingAddress">Mailing Address</Label>
              <Textarea id="mailingAddress" name="mailingAddress" placeholder="Enter mailing address" required />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sameAsPermanent"
                  className="h-4 w-4 rounded border-gray-300"
                  onChange={(e) => {
                    const permanentAddress = (document.getElementById("permanentAddress") as HTMLTextAreaElement).value
                    if (e.target.checked) {
                      ;(document.getElementById("mailingAddress") as HTMLTextAreaElement).value = permanentAddress
                    }
                  }}
                />
                <Label htmlFor="sameAsPermanent" className="text-sm font-normal">
                  Same as permanent address
                </Label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" name="phoneNumber" placeholder="Enter phone number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input id="occupation" name="occupation" placeholder="Enter occupation" required />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="mb-4 text-lg font-medium">Nominee Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nomineeName">Nominee Name</Label>
                  <Input id="nomineeName" name="nomineeName" placeholder="Enter nominee name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nomineeRelationship">Relationship</Label>
                  <Input id="nomineeRelationship" name="nomineeRelationship" placeholder="e.g., Spouse, Child" />
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nomineeId">Nominee ID No.</Label>
                  <Input id="nomineeId" name="nomineeId" placeholder="Enter nominee ID number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nomineePhone">Nominee Phone</Label>
                  <Input id="nomineePhone" name="nomineePhone" placeholder="Enter nominee phone number" />
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="joinDate">Join Date</Label>
                <DatePicker date={joinDate} setDate={setJoinDate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initialShare">Initial Share Amount (RM)</Label>
                <Input
                  id="initialShare"
                  name="initialShare"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/members">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Save Member
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
