export interface Vendor {
  user: Vendor
  id: string
  phoneNumber: string
  fullName: string
  email: string
  role: string
  dateOfBirth?: string | null
  wallet_no?: string | null
  wallet_balance?: number | null
  bank_name?: string | null
  onboardingStep: number
  isOnboardingComplete: boolean
  business?: {
    id: string
    name: string
    businessType: string
  }
}

export interface VendorLoginData {
  identifier: string
  password: string
}

export interface VendorSignupData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export interface VendorEditData {
  fullName?: string
  email?: string
  phoneNumber?: string
  dateOfBirth?: string
  bank_name?: string
}

export interface BusinessData {
  name: string
  description: string
  businessType: string
  contactNumber: string
  website?: string
  address: string
  city: string
  state: string
  localGovernment?: string
  openingTime: string
  closingTime: string
  businessDays?: string
  deliveryOptions: string[]
  accountNumber?: string
  bankName?: string
  accountName?: string
  userId: string
  isActive?: boolean
}
