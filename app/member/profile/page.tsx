"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LockedField } from "@/components/ui/locked-field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock } from "lucide-react"


export default function MemberProfilePage() {
  const [profile, setProfile] = useState<Record<string, string | null>>({})
  const [form, setForm] = useState({ mobile_number: "", email: "", postal_address: "", postal_code: "", town: "", communication_pref: "PORTAL" })
  const [phoneOtp, setPhoneOtp] = useState("")
  const [showOtp, setShowOtp] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/member/profile").then((r) => r.json()).then((p) => {
      setProfile(p)
      setForm({
        mobile_number: p.mobile_number ?? "",
        email: p.email ?? "",
        postal_address: p.postal_address ?? "",
        postal_code: p.postal_code ?? "",
        town: p.town ?? "",
        communication_pref: p.communication_pref ?? "PORTAL",
      })
    })
  }, [])

  async function save() {
    if (form.mobile_number !== profile.mobile_number && !showOtp) {
      setShowOtp(true)
      setMsg("Enter OTP to confirm new mobile number.")
      return
    }

    const res = await fetch("/api/member/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setMsg("Profile updated.")
      setShowOtp(false)
      const p = await res.json()
      setProfile(p)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#0D2137]">My Profile</h1>
      <div className="flex items-center gap-2 text-sm text-gray-500"><Lock className="w-4 h-4" /> Locked fields cannot be edited here. <Link href="/member/discrepancy" className="text-[#1A7A4A] hover:underline">Report a discrepancy</Link></div>
      <div className="grid grid-cols-2 gap-4">
        <LockedField label="Full Name" value={profile.full_name} />
        <LockedField label="National ID" value={profile.national_id} />
        <LockedField label="Date of Birth" value={profile.date_of_birth ? new Date(profile.date_of_birth).toISOString().split("T")[0] : null} />
        <LockedField label="KRA PIN" value={profile.kra_pin} />
        <LockedField label="Employer" value={profile.employer_name} />
        <LockedField label="Member Number" value={profile.member_number} />
      </div>
      <div className="space-y-3 border-t pt-4">
        <div><Label>Mobile Number</Label><Input value={form.mobile_number} onChange={(e) => setForm({ ...form, mobile_number: e.target.value })} /></div>
        {showOtp && <div><Label>Verification Code</Label><Input type="text" value={phoneOtp} onChange={(e) => setPhoneOtp(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))} maxLength={6} placeholder="ABC123" autoComplete="one-time-code" className="font-mono tracking-widest text-center" /></div>}
        <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><Label>Address</Label><Input value={form.postal_address} onChange={(e) => setForm({ ...form, postal_address: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Town</Label><Input value={form.town} onChange={(e) => setForm({ ...form, town: e.target.value })} /></div>
          <div><Label>Code</Label><Input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} /></div>
        </div>
        <div><Label>Communication Preference</Label>
          <Select value={form.communication_pref} onValueChange={(v) => setForm({ ...form, communication_pref: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PORTAL">Portal</SelectItem>
              <SelectItem value="EMAIL">Email</SelectItem>
              <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {msg && <Alert><AlertDescription>{msg}</AlertDescription></Alert>}
      <Button onClick={save} className="bg-[#1A7A4A] text-white">Save Changes</Button>
    </div>
  )
}
