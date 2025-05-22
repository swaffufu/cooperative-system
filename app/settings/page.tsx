"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { getCooperativeInfo, updateCooperativeInfo } from "@/app/actions/cooperative"
import { useQuery } from "@tanstack/react-query"
import { toast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    data: cooperative,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cooperative"],
    queryFn: getCooperativeInfo,
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      await updateCooperativeInfo(formData)

      toast({
        title: "Settings updated",
        description: "Cooperative information has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating settings:", error)
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 md:ml-64">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (error || !cooperative) {
    return (
      <div className="flex flex-col gap-6 md:ml-64">
        <div className="text-red-500">Error loading cooperative information. Please refresh the page.</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 md:ml-64">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your cooperative's settings and preferences.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Cooperative Information</CardTitle>
            <CardDescription>Update your cooperative's details and contact information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Cooperative Name</Label>
              <Input id="name" name="name" defaultValue={cooperative.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regNumber">Registration Number</Label>
              <Input id="regNumber" name="regNumber" defaultValue={cooperative.registration_number || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" defaultValue={cooperative.address || ""} rows={3} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={cooperative.email || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={cooperative.phone || ""} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fax">Fax</Label>
              <Input id="fax" name="fax" defaultValue={cooperative.fax || ""} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>Configure system-wide settings and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="memberPrefix">Member Number Prefix</Label>
            <Input id="memberPrefix" placeholder="e.g., MEM" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receiptPrefix">Receipt Number Prefix</Label>
            <Input id="receiptPrefix" placeholder="e.g., RCP" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultDividendRate">Default Dividend Rate (%)</Label>
            <Input id="defaultDividendRate" type="number" min="0" max="100" step="0.01" defaultValue="3.00" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Settings</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
