"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, User, Mail, Phone, Building, Camera, Save } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"

export default function ProfilePage() {
  const { vendor, updateProfile, isLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: vendor?.fullName || "",
    email: vendor?.email || "",
    phoneNumber: vendor?.phoneNumber || "",
    dateOfBirth: vendor?.dateOfBirth || "",
    bank_name: vendor?.bank_name || "",
    businessName: vendor?.business?.name || "",
    businessType: vendor?.business?.businessType || "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      await updateProfile(formData)
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
      // You can add toast notification here
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/dashboard">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Profile</h1>
              <p className="text-sm text-gray-500">Manage your account</p>
            </div>
          </div>
          <button onClick={() => setIsEditing(!isEditing)} className="text-orange-600 font-medium">
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Profile Image */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
                {vendor?.fullName ? (
                  <span className="text-2xl font-bold text-orange-600">
                    {vendor.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                ) : (
                  <User className="w-12 h-12 text-orange-600" />
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-4">{vendor?.fullName || "Vendor Name"}</h2>
            <p className="text-gray-600">{vendor?.business?.name || "Business Name"}</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="mobile-input"
                />
              ) : (
                <p className="text-gray-900">{vendor?.fullName || "Not provided"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="mobile-input"
                  />
                ) : (
                  <p className="text-gray-900">{vendor?.email || "Not provided"}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className="mobile-input"
                  />
                ) : (
                  <p className="text-gray-900">{vendor?.phoneNumber || "Not provided"}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className="mobile-input"
                />
              ) : (
                <p className="text-gray-900">{vendor?.dateOfBirth || "Not provided"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-gray-400" />
                <p className="text-gray-900">{vendor?.business?.name || "Not provided"}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
              <p className="text-gray-900">{vendor?.business?.businessType || "Not provided"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.bank_name}
                  onChange={(e) => handleInputChange("bank_name", e.target.value)}
                  className="mobile-input"
                  placeholder="Enter bank name"
                />
              ) : (
                <p className="text-gray-900">{vendor?.bank_name || "Not provided"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Onboarding Status</label>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${vendor?.isOnboardingComplete ? "bg-green-500" : "bg-orange-500"}`}
                ></div>
                <p className="text-gray-900">
                  {vendor?.isOnboardingComplete ? "Complete" : `Step ${vendor?.onboardingStep || 1} of 4`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <button onClick={handleSave} className="mobile-button flex items-center justify-center gap-2">
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        )}
      </main>
    </div>
  )
}
