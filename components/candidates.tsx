"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Upload, LinkIcon, AlertCircle, X, Filter, Download } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { CandidateDetail } from "@/components/candidate-detail"
import { useToast } from "@/components/ui/use-toast"

const candidatesData = [
  {
    id: 1,
    candidateNo: "C001",
    name: "John Smith",
    country: "アメリカ",
    gender: "男性",
    age: 28,
    desiredJob: "ITエンジニア",
    desiredLocation: "東京都",
    status: "active", // Changed to new status system
    candidateStatus: "面談前", // Renamed from status to candidateStatus
    residenceStatus: "技術・人文知識・国際業務",
    residenceExpiry: "2025-03-15",
    lastContact: "2024-01-15 14:30",
    avatar: "/placeholder.svg?height=40&width=40",
    residence: "東京都渋谷区",
    applicationRoute: "Facebook広告A",
    applicationLink: "https://example.com/apply/123",
    facebookProfile: "https://facebook.com/johnsmith",
    messengerLink: "https://m.me/johnsmith",
    assignedCA: "田中CA",
    assigned_ca_id: 1, // Added CA ID reference
    facebook_user_id: "fb_123456789", // Added Facebook user ID
    page_id: 1, // Added page reference
    external_id: "EXT001", // Added external ID
    notes: "ITエンジニア経験5年、日本語N2レベル", // Added notes field
  },
  {
    id: 2,
    candidateNo: "C002",
    name: "Maria Garcia",
    country: "スペイン",
    gender: "女性",
    age: 32,
    desiredJob: "マーケティング",
    desiredLocation: "大阪府",
    status: "active",
    candidateStatus: "面談予定",
    residenceStatus: "技術・人文知識・国際業務",
    residenceExpiry: "2024-12-20",
    lastContact: "2024-01-14 16:45",
    avatar: "/placeholder.svg?height=40&width=40",
    residence: "大阪府大阪市",
    applicationRoute: "Instagram広告",
    applicationLink: "https://example.com/apply/124",
    facebookProfile: "https://facebook.com/mariagarcia",
    messengerLink: "https://m.me/mariagarcia",
    assignedCA: "佐藤CA",
    assigned_ca_id: 2,
    facebook_user_id: "fb_234567890",
    page_id: 1,
    external_id: "EXT002",
    notes: "マーケティング経験3年、スペイン語ネイティブ",
  },
  {
    id: 3,
    candidateNo: "C003",
    name: "Chen Wei",
    country: "中国",
    gender: "男性",
    age: 26,
    desiredJob: "デザイナー",
    desiredLocation: "東京都",
    status: "pre_registered", // Pre-registered status example
    candidateStatus: "推薦済み",
    residenceStatus: "留学",
    residenceExpiry: "2024-08-30",
    lastContact: "2024-01-13 10:20",
    avatar: "/placeholder.svg?height=40&width=40",
    residence: "東京都新宿区",
    applicationRoute: "LinkedIn広告",
    applicationLink: "https://example.com/apply/125",
    facebookProfile: "https://facebook.com/chenwei",
    messengerLink: "https://m.me/chenwei",
    assignedCA: "鈴木CA",
    assigned_ca_id: 3,
    facebook_user_id: null, // No Facebook ID yet
    page_id: 2,
    external_id: "EXT003",
    notes: "デザイン経験2年、中国語ネイティブ",
  },
  {
    id: 4,
    candidateNo: "C004",
    name: "Ahmed Hassan",
    country: "エジプト",
    gender: "男性",
    age: 30,
    desiredJob: "営業",
    desiredLocation: "愛知県",
    status: "active",
    candidateStatus: "選考中",
    residenceStatus: "技術・人文知識・国際業務",
    residenceExpiry: "2025-06-10",
    lastContact: "2024-01-12 09:15",
    avatar: "/placeholder.svg?height=40&width=40",
    residence: "愛知県名古屋市",
    applicationRoute: "Facebook広告B",
    applicationLink: "https://example.com/apply/126",
    facebookProfile: "https://facebook.com/ahmedhassan",
    messengerLink: "https://m.me/ahmedhassan",
    assignedCA: "田中CA",
    assigned_ca_id: 1,
    facebook_user_id: "fb_345678901",
    page_id: 1,
    external_id: "EXT004",
    notes: "営業経験7年、アラビア語・英語対応可能",
  },
  {
    id: 5,
    candidateNo: "C005",
    name: "Lisa Johnson",
    country: "カナダ",
    gender: "女性",
    age: 29,
    desiredJob: "マーケティング",
    desiredLocation: "東京都",
    status: "pre_registered",
    candidateStatus: "面談前",
    residenceStatus: "ワーキングホリデー",
    residenceExpiry: "2024-11-15",
    lastContact: "2024-01-11 13:25",
    avatar: "/placeholder.svg?height=40&width=40",
    residence: "東京都港区",
    applicationRoute: "Twitter広告",
    applicationLink: "https://example.com/apply/127",
    facebookProfile: "https://facebook.com/lisajohnson",
    messengerLink: "https://m.me/lisajohnson",
    assignedCA: "佐藤CA",
    assigned_ca_id: 2,
    facebook_user_id: null,
    page_id: 2,
    external_id: "EXT005",
    notes: "マーケティング経験4年、英語ネイティブ",
  },
]

const facebookPages = [
  { id: 1, page_name: "GlobalHire Hub Japan", facebook_page_id: "123456789012345" },
  { id: 2, page_name: "GlobalHire Hub Korea", facebook_page_id: "234567890123456" },
  { id: 3, page_name: "GlobalHire Hub Philippines", facebook_page_id: "345678901234567" },
]

const pageCAAssignments = [
  { page_id: 1, ca_id: 1 }, // GlobalHire Hub Japan - 田中 太郎
  { page_id: 1, ca_id: 2 }, // GlobalHire Hub Japan - 佐藤 花子
  { page_id: 2, ca_id: 3 }, // GlobalHire Hub Korea - 鈴木 一郎
  { page_id: 3, ca_id: 4 }, // GlobalHire Hub Philippines - 高橋 美咲
]

const statusOptions = [
  "面談前",
  "面談予定",
  "面談後（未推薦）",
  "推薦済み",
  "選考中",
  "内定",
  "勤務中",
  "選考辞退",
  "紹介先なし",
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "面談前":
      return "bg-blue-100 text-blue-800"
    case "面談予定":
      return "bg-orange-100 text-orange-800"
    case "面談後（未推薦）":
      return "bg-gray-100 text-gray-800"
    case "推薦済み":
      return "bg-purple-100 text-purple-800"
    case "選考中":
      return "bg-yellow-100 text-yellow-800"
    case "内定":
      return "bg-green-100 text-green-800"
    case "勤務中":
      return "bg-emerald-100 text-emerald-800"
    case "選考辞退":
      return "bg-red-100 text-red-800"
    case "紹介先なし":
      return "bg-slate-100 text-slate-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getResidenceExpiryColor = (expiry: string) => {
  const expiryDate = new Date(expiry)
  const today = new Date()
  const diffTime = expiryDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays <= 30) return "text-red-600"
  if (diffDays <= 90) return "text-orange-600"
  return "text-gray-600"
}

interface Education {
  id: number
  start_date: string
  end_date: string | null
  school_name: string
  faculty: string | null
  department: string | null
  study_details: string | null
}

interface WorkExperience {
  id: number
  start_date: string
  end_date: string | null
  company_name: string
  job_details: string
}

interface CandidatesProps {
  selectedCandidateId?: string | null
  onBack?: () => void
  onNavigate?: (route: string, id?: string | number) => void
  onNavigateToDetail?: (id: string | number) => void
  onNavigateToMessages?: (id: string | number) => void
}

type Basis = "lastContact" | "created" | "statusUpdated"
type Period = "none" | "today" | "thisWeek" | "thisMonth" | "custom"
type FilterState = {
  basis: Basis
  period: Period
  from?: string
  to?: string
  caId?: string
  countries: string[]
  jobs: string[]
  locations: string[]
  statuses: string[]
  q: string
  nationality?: string
  jobType?: string
  workLocation?: string
  status?: string
}

const defaultFilter: FilterState = {
  basis: "lastContact",
  period: "none",
  countries: [],
  jobs: [],
  locations: [],
  statuses: [],
  q: "",
}

export default function Candidates({
  selectedCandidateId,
  onBack,
  onNavigate,
  onNavigateToDetail,
  onNavigateToMessages,
}: CandidatesProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  const [internalSelectedCandidateId, setInternalSelectedCandidateId] = useState<string | null>(null)

  const [filter, setFilter] = useState<FilterState>(() => {
    try {
      const saved = localStorage.getItem("candidates_filter_v2")
      return saved ? { ...defaultFilter, ...JSON.parse(saved) } : defaultFilter
    } catch {
      return defaultFilter
    }
  })

  useEffect(() => {
    localStorage.setItem("candidates_filter_v2", JSON.stringify(filter))
  }, [filter])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false)
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<any[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [candidates, setCandidates] = useState(candidatesData)
  const [csvPreview, setCsvPreview] = useState<any[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newCandidate, setNewCandidate] = useState({
    candidateNo: "",
    name: "",
    country: "",
    gender: "",
    age: "",
    desiredJob: "",
    desiredLocation: "",
    status: "pre_registered", // Default to pre_registered
    candidateStatus: "面談前",
    residenceStatus: "",
    residenceExpiry: "",
    residence: "",
    applicationRoute: "",
    applicationLink: "",
    facebookProfile: "",
    messengerLink: "",
    assignedCA: "",
    assigned_ca_id: 0, // Added CA ID field
    facebook_user_id: "", // Added Facebook user ID field
    page_id: 0, // Added page ID field
    external_id: "", // Added external ID field
    notes: "", // Added notes field
  })
  const [newEducation, setNewEducation] = useState<Education[]>([])
  const [newWorkExperience, setNewWorkExperience] = useState<WorkExperience[]>([])
  const [educationErrors, setEducationErrors] = useState<Record<number, Record<string, string>>>({})
  const [workErrors, setWorkErrors] = useState<Record<number, Record<string, string>>>({})
  const [selectedCandidateForLink, setSelectedCandidateForLink] = useState<any>(null)
  const [isLinkFacebookOpen, setIsLinkFacebookOpen] = useState(false)

  function getRange(period: Period, from?: string, to?: string) {
    if (period === "none") return null
    const now = new Date()
    let s: Date, e: Date

    if (period === "today") {
      s = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
      e = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    } else if (period === "thisWeek") {
      const day = (now.getDay() + 6) % 7 // Monday = 0
      s = new Date(now)
      s.setDate(now.getDate() - day)
      s.setHours(0, 0, 0, 0)
      e = new Date(s)
      e.setDate(s.getDate() + 6)
      e.setHours(23, 59, 59, 999)
    } else if (period === "thisMonth") {
      s = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
      e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    } else {
      // custom
      s = from ? new Date(from + "T00:00:00") : new Date("1970-01-01")
      e = to ? new Date(to + "T23:59:59") : new Date("2999-12-31")
    }
    return { start: s, end: e }
  }

  function inRange(ts?: string) {
    const r = getRange(filter.period, filter.from, filter.to)
    if (!r) return true
    if (!ts) return false
    const d = new Date(ts)
    return d >= r.start && d <= r.end
  }

  function matchMulti(val: string | string[] | undefined, selected: string[]) {
    if (!selected || selected.length === 0) return true
    if (!val) return false
    const arr = Array.isArray(val) ? val : [val]
    return selected.some((sel) => arr.some((v) => String(v).includes(sel)))
  }

  function matchOne(val: string | undefined, selected?: string) {
    if (!selected) return true
    return String(val || "") === selected
  }

  function matchAny(vals: string[], q: string) {
    if (!q) return true
    const t = q.toLowerCase()
    return vals.some((v) => (v || "").toLowerCase().includes(t))
  }

  const countries = ["アメリカ", "スペイン", "中国", "エジプト", "カナダ", "日本", "韓国", "フィリピン"]
  const jobs = ["ITエンジニア", "マーケティング", "デザイナー", "営業"]
  const locations = ["東京都", "大阪府", "愛知県"]

  const getFilteredCandidates = () => {
    let filteredData = candidates

    // Apply permission-based filtering using page assignments
    if (user?.role === "ca_staff") {
      // CA staff can only see candidates from pages they're assigned to
      const userAssignedPages = pageCAAssignments
        .filter((assignment) => assignment.ca_id === user.id)
        .map((assignment) => assignment.page_id)
      filteredData = filteredData.filter((candidate) => userAssignedPages.includes(candidate.page_id))
    } else if (user?.role === "ca_manager") {
      // CA managers can see candidates from pages they're assigned to + managed CA pages
      const userAssignedPages = pageCAAssignments
        .filter((assignment) => assignment.ca_id === user.id)
        .map((assignment) => assignment.page_id)

      const managedCAIds = user.managedCAs || []
      const managedCAPages = pageCAAssignments
        .filter((assignment) => managedCAIds.includes(assignment.ca_id))
        .map((assignment) => assignment.page_id)

      const allAccessiblePages = [...userAssignedPages, ...managedCAPages]
      filteredData = filteredData.filter((candidate) => allAccessiblePages.includes(candidate.page_id))
    }
    // Admin users see all candidates (no additional filtering)

    return filteredData.filter((candidate) => {
      // Date filtering
      const ts =
        filter.basis === "lastContact"
          ? candidate.lastContact
          : filter.basis === "created"
            ? candidate.createdAt
            : candidate.statusUpdatedAt
      if (!inRange(ts)) return false

      // Single selection filters
      if (!matchOne(candidate.assigned_ca_id?.toString(), filter.caId)) return false

      // Multi-selection filters
      if (!matchMulti(candidate.country, filter.countries)) return false
      if (!matchMulti(candidate.desiredJob, filter.jobs)) return false
      if (!matchMulti(candidate.desiredLocation, filter.locations)) return false
      if (!matchMulti(candidate.candidateStatus, filter.statuses)) return false

      // Keyword search
      if (
        !matchAny(
          [candidate.name, candidate.notes, candidate.desiredJob, candidate.desiredLocation, candidate.country],
          filter.q,
        )
      )
        return false

      // Legacy search term
      const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }

  const filteredCandidates = useMemo(() => getFilteredCandidates(), [candidates, filter, searchTerm, user])

  const caOptions = useMemo(
    () => [...new Set(candidates.map((c) => c.assignedCA).filter(Boolean))].sort(),
    [candidates],
  )
  const selectionStatuses = ["面談前", "CA面談", "書類選考", "面接選考", "内定", "決定"]

  const resetFilters = () => {
    setFilter(defaultFilter)
    setSearchTerm("")
  }

  const applyFilters = () => {
    // Filters are applied automatically via useMemo, just show toast
    toast({
      title: "フィルタを適用しました",
      description: `${filteredCandidates.length}件の求職者が表示されています`,
    })
  }

  const caList = [
    { id: 1, name: "田中 太郎" },
    { id: 2, name: "佐藤 花子" },
    { id: 3, name: "鈴木 一郎" },
    { id: 4, name: "高橋 美咲" },
  ]

  const mockUsers = [
    { id: 1, name: "田中 太郎", role: "ca_staff" },
    { id: 2, name: "佐藤 花子", role: "ca_staff" },
    { id: 3, name: "鈴木 一郎", role: "ca_staff" },
    { id: 4, name: "高橋 美咲", role: "ca_staff" },
    { id: 5, name: "山田 課長", role: "ca_manager", managedCAs: [1, 2] },
    { id: 6, name: "管理者", role: "admin" },
  ]

  const validateEducation = (edu: Partial<Education>): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!edu.school_name?.trim()) {
      errors.school_name = "学校名は必須です"
    } else if (edu.school_name.length > 100) {
      errors.school_name = "学校名は100文字以内で入力してください"
    }

    if (!edu.start_date) {
      errors.start_date = "入学日は必須です"
    }

    if (edu.start_date && edu.end_date && edu.start_date > edu.end_date) {
      errors.end_date = "卒業日は入学日以降の日付を入力してください"
    }

    if (edu.faculty && edu.faculty.length > 100) {
      errors.faculty = "学部は100文字以内で入力してください"
    }

    if (edu.department && edu.department.length > 100) {
      errors.department = "学科は100文字以内で入力してください"
    }

    if (edu.study_details && edu.study_details.length > 2000) {
      errors.study_details = "学習内容は2000文字以内で入力してください"
    }

    return errors
  }

  const validateWorkExperience = (work: Partial<WorkExperience>): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!work.company_name?.trim()) {
      errors.company_name = "会社名は必須です"
    } else if (work.company_name.length > 100) {
      errors.company_name = "会社名は100文字以内で入力してください"
    }

    if (!work.start_date) {
      errors.start_date = "入社日は必須です"
    }

    if (!work.job_details?.trim()) {
      errors.job_details = "業務内容は必須です"
    } else if (work.job_details.length > 2000) {
      errors.job_details = "業務内容は2000文字以内で入力してください"
    }

    if (work.start_date && work.end_date && work.start_date > work.end_date) {
      errors.end_date = "退職日は入社日以降の日付を入力してください"
    }

    return errors
  }

  const handleAddEducation = () => {
    const newEdu: Education = {
      id: Date.now(),
      start_date: "",
      end_date: null,
      school_name: "",
      faculty: "",
      department: "",
      study_details: "",
    }
    setNewEducation([...newEducation, newEdu])
  }

  const handleUpdateEducation = (id: number, field: keyof Education, value: string | null) => {
    setNewEducation(newEducation.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)))

    // Clear errors for this field
    if (educationErrors[id]) {
      const newErrors = { ...educationErrors }
      delete newErrors[id][field]
      if (Object.keys(newErrors[id]).length === 0) {
        delete newErrors[id]
      }
      setEducationErrors(newErrors)
    }
  }

  const handleRemoveEducation = (id: number) => {
    setNewEducation(newEducation.filter((edu) => edu.id !== id))
    const newErrors = { ...educationErrors }
    delete newErrors[id]
    setEducationErrors(newErrors)
  }

  const handleAddWorkExperience = () => {
    const newWork: WorkExperience = {
      id: Date.now(),
      start_date: "",
      end_date: null,
      company_name: "",
      job_details: "",
    }
    setNewWorkExperience([...newWorkExperience, newWork])
  }

  const handleUpdateWorkExperience = (id: number, field: keyof WorkExperience, value: string | null) => {
    setNewWorkExperience(newWorkExperience.map((work) => (work.id === id ? { ...work, [field]: value } : work)))

    // Clear errors for this field
    if (workErrors[id]) {
      const newErrors = { ...workErrors }
      delete newErrors[id][field]
      if (Object.keys(newErrors[id]).length === 0) {
        delete newErrors[id]
      }
      setWorkErrors(newErrors)
    }
  }

  const handleRemoveWorkExperience = (id: number) => {
    setNewWorkExperience(newWorkExperience.filter((work) => work.id !== id))
    const newErrors = { ...workErrors }
    delete newErrors[id]
    setWorkErrors(newErrors)
  }

  const downloadCsvFormat = () => {
    const headers = [
      "求職者No",
      "名前",
      "国籍",
      "性別",
      "年齢",
      "希望職種",
      "希望勤務地",
      "ステータス",
      "在留資格",
      "在留期限",
      "居住地",
      "応募経路",
      "応募リンク",
      "Facebookプロフィール",
      "Messengerリンク",
      "担当CA",
      "Facebook User ID",
      "Page ID",
      "External ID",
      "備考",
    ]

    const csvContent =
      headers.join(",") +
      "\n" +
      "C001,山田太郎,日本,男性,25,ITエンジニア,東京都,active,技術・人文知識・国際業務,2025-12-31,東京都渋谷区,Facebook広告,https://example.com,https://facebook.com/example,https://m.me/example,田中CA,123456789,page_123,EXT001,優秀な求職者"

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "求職者登録フォーマット.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportCandidatesToCsv = () => {
    const headers = [
      "求職者No",
      "名前",
      "国籍",
      "性別",
      "年齢",
      "希望職種",
      "希望勤務地",
      "ステータス",
      "在留資格",
      "在留期限",
      "居住地",
      "応募経路",
      "応募リンク",
      "Facebookプロフィール",
      "Messengerリンク",
      "担当CA",
      "Facebook User ID",
      "Page ID",
      "External ID",
      "備考",
    ]

    const csvRows = filteredCandidates.map((candidate) =>
      [
        candidate.candidateNo,
        candidate.name,
        candidate.country,
        candidate.gender,
        candidate.age,
        candidate.desiredJob,
        candidate.desiredLocation,
        candidate.status,
        candidate.residenceStatus,
        candidate.residenceExpiry,
        candidate.residence,
        candidate.applicationRoute,
        candidate.applicationLink || "",
        candidate.facebookProfile || "",
        candidate.messengerLink || "",
        candidate.assignedCA,
        candidate.facebook_user_id || "",
        candidate.page_id || "",
        candidate.external_id || "",
        candidate.notes || "",
      ].join(","),
    )

    const csvContent = headers.join(",") + "\n" + csvRows.join("\n")
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `求職者一覧_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCsvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setCsvFile(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split("\n").filter((line) => line.trim())
      const headers = lines[0].split(",")

      const data = lines.slice(1).map((line, index) => {
        const values = line.split(",")
        const row: any = {}
        headers.forEach((header, i) => {
          row[header.trim()] = values[i]?.trim() || ""
        })
        row.lineNumber = index + 2
        return row
      })

      setCsvPreview(data)
      validateCsvData(data)
    }

    reader.readAsText(file, "UTF-8")
  }

  const validateCsvData = (data: any[]) => {
    const errors: string[] = []
    const requiredFields = ["求職者No", "名前", "国籍", "性別", "年齢", "担当CA"]
    const validStatuses = ["active", "pre_registered"]
    const validGenders = ["男性", "女性"]

    // Get available CAs for validation
    const availableCAs = mockUsers
      .filter((user) => user.role === "ca_staff" || user.role === "ca_manager")
      .map((user) => user.name)

    data.forEach((row, index) => {
      const lineNumber = index + 2

      // Required field validation
      requiredFields.forEach((field) => {
        if (!row[field]) {
          errors.push(`${lineNumber}行目: ${field}が入力されていません`)
        }
      })

      // Age validation
      if (row["年齢"]) {
        const age = Number(row["年齢"])
        if (isNaN(age) || age < 18 || age > 70) {
          errors.push(`${lineNumber}行目: 年齢は18-70の数値で入力してください`)
        }
      }

      // Gender validation
      if (row["性別"] && !validGenders.includes(row["性別"])) {
        errors.push(`${lineNumber}行目: 性別は「男性」または「女性」で入力してください`)
      }

      // Status validation
      if (row["ステータス"] && !validStatuses.includes(row["ステータス"])) {
        errors.push(`${lineNumber}行目: ステータスは「active」または「pre_registered」で入力してください`)
      }

      // CA assignment validation
      if (row["担当CA"] && !availableCAs.includes(row["担当CA"])) {
        errors.push(`${lineNumber}行目: 担当CA「${row["担当CA"]}」は存在しません`)
      }

      // Facebook User ID format validation
      if (row["Facebook User ID"] && !/^\d+$/.test(row["Facebook User ID"])) {
        errors.push(`${lineNumber}行目: Facebook User IDは数値で入力してください`)
      }

      // Page ID format validation
      if (row["Page ID"] && !/^page_\w+$/.test(row["Page ID"])) {
        errors.push(`${lineNumber}行目: Page IDは「page_」で始まる形式で入力してください`)
      }

      // Check for duplicate Facebook User IDs within the CSV
      if (row["Facebook User ID"]) {
        const duplicateInCsv = data.find(
          (otherRow, otherIndex) => otherIndex !== index && otherRow["Facebook User ID"] === row["Facebook User ID"],
        )
        if (duplicateInCsv) {
          errors.push(`${lineNumber}行目: Facebook User ID「${row["Facebook User ID"]}」が重複しています`)
        }

        // Check against existing candidates with different candidate numbers
        const existingFbUser = candidates.find(
          (c) => c.facebook_user_id === row["Facebook User ID"] && c.candidateNo !== row["求職者No"],
        )
        if (existingFbUser) {
          errors.push(
            `${lineNumber}行目: Facebook User ID「${row["Facebook User ID"]}」は別の求職者No「${existingFbUser.candidateNo}」で既に登録されています`,
          )
        }
      }
    })

    setCsvErrors(errors)
  }

  const handleCsvImport = () => {
    if (csvErrors.length > 0) {
      alert("エラーを修正してからインポートしてください")
      return
    }

    let overwriteCount = 0
    let addCount = 0

    const updatedCandidates = [...candidates]

    csvPreview.forEach((row) => {
      // Find assigned CA ID
      const assignedCA = mockUsers.find((user) => user.name === row["担当CA"])

      const candidateData = {
        candidateNo: row["求職者No"] || "",
        name: row["名前"] || "",
        country: row["国籍"] || "",
        gender: row["性別"] || "",
        age: Number(row["年齢"]) || 0,
        desiredJob: row["希望職種"] || "",
        desiredLocation: row["希望勤務地"] || "",
        status: row["ステータス"] || "active",
        residenceStatus: row["在留資格"] || "",
        residenceExpiry: row["在留期限"] || "",
        residence: row["居住地"] || "",
        applicationRoute: row["応募経路"] || "",
        applicationLink: row["応募リンク"] || "",
        facebookProfile: row["Facebookプロフィール"] || "",
        messengerLink: row["Messengerリンク"] || "",
        assignedCA: row["担当CA"] || "",
        assigned_ca_id: assignedCA?.id || null,
        facebook_user_id: row["Facebook User ID"] || null,
        page_id: row["Page ID"] || null,
        external_id: row["External ID"] || null,
        notes: row["備考"] || "",
        lastContact: new Date()
          .toLocaleString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
          .replace(/\//g, "-"),
        avatar: "/placeholder.svg?height=40&width=40",
      }

      // Check if candidate exists by candidate number
      const existingIndex = updatedCandidates.findIndex((c) => c.candidateNo === candidateData.candidateNo)

      if (existingIndex !== -1) {
        // Overwrite existing candidate
        updatedCandidates[existingIndex] = {
          ...updatedCandidates[existingIndex],
          ...candidateData,
        }
        overwriteCount++
      } else {
        // Add new candidate
        const newCandidate = {
          id: Math.max(...updatedCandidates.map((c) => c.id), 0) + addCount + 1,
          ...candidateData,
        }
        updatedCandidates.push(newCandidate)
        addCount++
      }
    })

    setCandidates(updatedCandidates)
    setIsCsvImportOpen(false)
    setCsvFile(null)
    setCsvPreview([])
    setCsvErrors([])

    alert(`インポートが完了しました（上書き ${overwriteCount} 件／追加 ${addCount} 件）`)
  }

  const generateCandidateNo = () => {
    const maxNo = Math.max(
      ...candidates.map((c) => {
        const match = c.candidateNo.match(/C(\d+)/)
        return match ? Number.parseInt(match[1]) : 0
      }),
      0,
    )
    return `C${String(maxNo + 1).padStart(3, "0")}`
  }

  const handleAddCandidate = () => {
    if (
      !newCandidate.name ||
      !newCandidate.country ||
      !newCandidate.gender ||
      !newCandidate.age ||
      !newCandidate.assigned_ca_id
    ) {
      alert("必須項目を入力してください。")
      return
    }

    const candidateNo = newCandidate.candidateNo || generateCandidateNo()

    let hasErrors = false
    const newEducationErrors: Record<number, Record<string, string>> = {}
    const newWorkErrors: Record<number, Record<string, string>> = {}

    // Validate education entries
    newEducation.forEach((edu) => {
      const errors = validateEducation(edu)
      if (Object.keys(errors).length > 0) {
        newEducationErrors[edu.id] = errors
        hasErrors = true
      }
    })

    // Validate work experience entries
    newWorkExperience.forEach((work) => {
      const errors = validateWorkExperience(work)
      if (Object.keys(errors).length > 0) {
        newWorkErrors[work.id] = errors
        hasErrors = true
      }
    })

    if (hasErrors) {
      setEducationErrors(newEducationErrors)
      setWorkErrors(newWorkErrors)
      return
    }

    const status = newCandidate.facebook_user_id ? "active" : "pre_registered"
    const assignedCAName = caList.find((ca) => ca.id === newCandidate.assigned_ca_id)?.name || ""

    const candidate = {
      id: Math.max(...candidates.map((c) => c.id)) + 1,
      candidateNo,
      ...newCandidate,
      status, // Auto-determine status based on Facebook User ID
      assignedCA: assignedCAName, // Set CA name from ID
      age: Number.parseInt(newCandidate.age),
      assigned_ca_id: Number(newCandidate.assigned_ca_id),
      page_id: Number(newCandidate.page_id) || null,
      lastContact: new Date()
        .toLocaleString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(/\//g, "-"),
      avatar: "/placeholder.svg?height=40&width=40",
    }

    setCandidates([...candidates, candidate])

    const statusMessage =
      status === "active"
        ? "求職者を登録しました。"
        : "求職者を事前登録しました。Facebook User IDが設定されるとアクティブになります。"

    alert(statusMessage)

    setNewCandidate({
      candidateNo: "",
      name: "",
      country: "",
      gender: "",
      age: "",
      desiredJob: "",
      desiredLocation: "",
      status: "pre_registered",
      candidateStatus: "面談前",
      residenceStatus: "",
      residenceExpiry: "",
      residence: "",
      applicationRoute: "",
      applicationLink: "",
      facebookProfile: "",
      messengerLink: "",
      assignedCA: "",
      assigned_ca_id: 0,
      facebook_user_id: "",
      page_id: 0,
      external_id: "",
      notes: "",
    })
    setNewEducation([])
    setNewWorkExperience([])
    setEducationErrors({})
    setWorkErrors({})
    setIsAddDialogOpen(false)
  }

  const handleLinkFacebook = (candidate: any) => {
    setSelectedCandidateForLink(candidate)
    setIsLinkFacebookOpen(true)
  }

  const handleFacebookLinkSubmit = (facebookUserId: string) => {
    if (selectedCandidateForLink && facebookUserId) {
      const updatedCandidates = candidates.map((candidate) =>
        candidate.id === selectedCandidateForLink.id
          ? {
              ...candidate,
              facebook_user_id: facebookUserId,
              status: "active", // Transition from pre_registered to active
              lastContact: new Date()
                .toLocaleString("ja-JP", {
                  year: "numeric",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
                .replace(/\//g, "-"),
            }
          : candidate,
      )
      setCandidates(updatedCandidates)

      // Show success message with status change info
      alert(
        `Facebook User IDを設定しました。求職者「${selectedCandidateForLink.name}」のステータスがアクティブに変更されました。`,
      )

      setIsLinkFacebookOpen(false)
      setSelectedCandidateForLink(null)
    }
  }

  const effectiveSelectedCandidateId = selectedCandidateId || internalSelectedCandidateId
  if (effectiveSelectedCandidateId) {
    const candidate = candidates.find((c) => c.id === Number(effectiveSelectedCandidateId))
    if (candidate) {
      return (
        <CandidateDetail
          candidateId={effectiveSelectedCandidateId.toString()}
          onBack={() => {
            setInternalSelectedCandidateId(null)
            onBack?.()
          }}
        />
      )
    }
  }

  const users = [
    { id: 1, name: "田中 太郎" },
    { id: 2, name: "佐藤 花子" },
    { id: 3, name: "鈴木 一郎" },
    { id: 4, name: "高橋 美咲" },
  ]

  const nationalities = ["日本", "アメリカ", "中国", "韓国", "その他"]
  const jobTypes = ["ITエンジニア", "営業", "マーケティング", "デザイナー", "その他"]
  const workLocations = ["東京", "大阪", "名古屋", "福岡", "その他"]

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              ← 戻る
            </Button>
          )}
          <h1 className="text-3xl font-bold tracking-tight">求職者管理</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={downloadCsvFormat} data-testid="csv-candidate-template">
            <Download className="h-4 w-4 mr-2" />
            CSVフォーマットDL
          </Button>
          <Button variant="outline" onClick={exportCandidatesToCsv} data-testid="csv-candidate-export">
            <Upload className="h-4 w-4 mr-2" />
            一覧をCSV出力
          </Button>
          <Dialog open={isCsvImportOpen} onOpenChange={setIsCsvImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                CSV一括登録
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>CSV一括登録</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csvFile">CSVファイル選択</Label>
                  <Input id="csvFile" type="file" accept=".csv" onChange={handleCsvFileChange} />
                  <div className="flex gap-2">
                    <p className="text-sm text-gray-600">
                      ※CSVフォーマットをダウンロードして、必要事項を入力してください
                    </p>
                    <Button variant="outline" size="sm" onClick={downloadCsvFormat}>
                      フォーマットをダウンロード
                    </Button>
                  </div>
                </div>

                {csvErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <h4 className="font-semibold text-red-800 mb-2">エラー一覧</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {csvErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {csvPreview.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">プレビュー ({csvPreview.length}件)</h4>
                    <div className="max-h-60 overflow-y-auto border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>求職者No</TableHead>
                            <TableHead>名前</TableHead>
                            <TableHead>国籍</TableHead>
                            <TableHead>性別</TableHead>
                            <TableHead>年齢</TableHead>
                            <TableHead>担当CA</TableHead>
                            <TableHead>ステータス</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {csvPreview.slice(0, 5).map((row, index) => (
                            <TableRow key={index}>
                              <TableCell>{row["求職者No"]}</TableCell>
                              <TableCell>{row["名前"]}</TableCell>
                              <TableCell>{row["国籍"]}</TableCell>
                              <TableCell>{row["性別"]}</TableCell>
                              <TableCell>{row["年齢"]}</TableCell>
                              <TableCell>{row["担当CA"]}</TableCell>
                              <TableCell>
                                <Badge variant={row["ステータス"] === "active" ? "default" : "secondary"}>
                                  {row["ステータス"] === "active" ? "アクティブ" : "事前登録"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {csvPreview.length > 5 && (
                        <p className="text-sm text-gray-600 p-2">...他{csvPreview.length - 5}件</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCsvImportOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleCsvImport} disabled={csvPreview.length === 0 || csvErrors.length > 0}>
                  インポート実行
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                求職者追加
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>新しい求職者を追加</DialogTitle>
                <DialogDescription>求職者の基本情報を入力してください。</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="candidateNo">求職者No</Label>
                    <Input
                      id="candidateNo"
                      value={newCandidate.candidateNo}
                      onChange={(e) => setNewCandidate({ ...newCandidate, candidateNo: e.target.value })}
                      placeholder="自動生成されます"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">名前 *</Label>
                    <Input
                      id="name"
                      value={newCandidate.name}
                      onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">国籍 *</Label>
                    <Input
                      id="country"
                      value={newCandidate.country}
                      onChange={(e) => setNewCandidate({ ...newCandidate, country: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">性別 *</Label>
                    <Select
                      value={newCandidate.gender}
                      onChange={(value) => setNewCandidate({ ...newCandidate, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="性別を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="男性">男性</SelectItem>
                        <SelectItem value="女性">女性</SelectItem>
                        <SelectItem value="その他">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">年齢 *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={newCandidate.age}
                      onChange={(e) => setNewCandidate({ ...newCandidate, age: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desiredJob">希望職種</Label>
                    <Input
                      id="desiredJob"
                      value={newCandidate.desiredJob}
                      onChange={(e) => setNewCandidate({ ...newCandidate, desiredJob: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desiredLocation">希望勤務地</Label>
                    <Input
                      id="desiredLocation"
                      value={newCandidate.desiredLocation}
                      onChange={(e) => setNewCandidate({ ...newCandidate, desiredLocation: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="candidateStatus">求職者ステータス</Label>
                    <Select
                      value={newCandidate.candidateStatus}
                      onChange={(value) => setNewCandidate({ ...newCandidate, candidateStatus: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="ステータスを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="面談前">面談前</SelectItem>
                        <SelectItem value="面談予定">面談予定</SelectItem>
                        <SelectItem value="推薦済み">推薦済み</SelectItem>
                        <SelectItem value="選考中">選考中</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="residenceStatus">在留資格</Label>
                    <Input
                      id="residenceStatus"
                      value={newCandidate.residenceStatus}
                      onChange={(e) => setNewCandidate({ ...newCandidate, residenceStatus: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="residenceExpiry">在留期限</Label>
                    <Input
                      id="residenceExpiry"
                      type="date"
                      value={newCandidate.residenceExpiry}
                      onChange={(e) => setNewCandidate({ ...newCandidate, residenceExpiry: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="residence">居住地</Label>
                    <Input
                      id="residence"
                      value={newCandidate.residence}
                      onChange={(e) => setNewCandidate({ ...newCandidate, residence: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="applicationRoute">応募経路</Label>
                    <Input
                      id="applicationRoute"
                      value={newCandidate.applicationRoute}
                      onChange={(e) => setNewCandidate({ ...newCandidate, applicationRoute: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebookLink">Facebookリンク</Label>
                    <div className="flex gap-2">
                      <Input
                        id="facebookLink"
                        value={newCandidate.facebookLink || ""}
                        onChange={(e) => setNewCandidate({ ...newCandidate, facebookLink: e.target.value })}
                        placeholder="https://facebook.com/username"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (newCandidate.facebookLink) {
                            window.open(newCandidate.facebookLink, "_blank", "noopener,noreferrer")
                          }
                        }}
                        disabled={!newCandidate.facebookLink}
                      >
                        遷移
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="messengerLink">メッセンジャーリンク</Label>
                    <Input
                      id="messengerLink"
                      value={newCandidate.messengerLink}
                      onChange={(e) => setNewCandidate({ ...newCandidate, messengerLink: e.target.value })}
                      placeholder="https://m.me/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignedCA">担当CA *</Label>
                    <Select
                      value={newCandidate.assigned_ca_id.toString()}
                      onChange={(value) => setNewCandidate({ ...newCandidate, assigned_ca_id: Number(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="担当CAを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {caList.map((ca) => (
                          <SelectItem key={ca.id} value={ca.id.toString()}>
                            {ca.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook_user_id">Facebook User ID</Label>
                    <Input
                      id="facebook_user_id"
                      value={newCandidate.facebook_user_id}
                      onChange={(e) => setNewCandidate({ ...newCandidate, facebook_user_id: e.target.value })}
                      placeholder="fb_123456789"
                    />
                    <p className="text-xs text-muted-foreground">
                      Facebook User IDがある場合は「active」、ない場合は「pre_registered」になります
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="page_id">Facebook Page</Label>
                    <Select
                      value={newCandidate.page_id.toString()}
                      onChange={(value) => setNewCandidate({ ...newCandidate, page_id: Number(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Facebookページを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">選択なし</SelectItem>
                        {facebookPages.map((page) => (
                          <SelectItem key={page.id} value={page.id.toString()}>
                            {page.page_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="external_id">外部ID</Label>
                    <Input
                      id="external_id"
                      value={newCandidate.external_id}
                      onChange={(e) => setNewCandidate({ ...newCandidate, external_id: e.target.value })}
                      placeholder="EXT001"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">備考</Label>
                  <Textarea
                    id="notes"
                    value={newCandidate.notes}
                    onChange={(e) => setNewCandidate({ ...newCandidate, notes: e.target.value })}
                    placeholder="求職者に関する追加情報やメモ"
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">学歴</h3>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddEducation}>
                      <Plus className="h-4 w-4 mr-2" />
                      追加
                    </Button>
                  </div>
                  {newEducation.map((edu) => (
                    <Card key={edu.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-end">
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveEducation(edu.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">入学日 *</Label>
                            <Input
                              type="date"
                              value={edu.start_date}
                              onChange={(e) => handleUpdateEducation(edu.id, "start_date", e.target.value)}
                              className="mt-1"
                            />
                            {educationErrors[edu.id]?.start_date && (
                              <p className="text-red-500 text-xs mt-1">{educationErrors[edu.id].start_date}</p>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-medium">卒業日</Label>
                            <Input
                              type="date"
                              value={edu.end_date || ""}
                              onChange={(e) => handleUpdateEducation(edu.id, "end_date", e.target.value || null)}
                              className="mt-1"
                            />
                            {educationErrors[edu.id]?.end_date && (
                              <p className="text-red-500 text-xs mt-1">{educationErrors[edu.id].end_date}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">学校名 *</Label>
                          <Input
                            value={edu.school_name}
                            onChange={(e) => handleUpdateEducation(edu.id, "school_name", e.target.value)}
                            className="mt-1"
                            placeholder="学校名を入力"
                          />
                          {educationErrors[edu.id]?.school_name && (
                            <p className="text-red-500 text-xs mt-1">{educationErrors[edu.id].school_name}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">学部</Label>
                            <Input
                              value={edu.faculty || ""}
                              onChange={(e) => handleUpdateEducation(edu.id, "faculty", e.target.value)}
                              className="mt-1"
                              placeholder="学部を入力"
                            />
                            {educationErrors[edu.id]?.faculty && (
                              <p className="text-red-500 text-xs mt-1">{educationErrors[edu.id].faculty}</p>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-medium">学科</Label>
                            <Input
                              value={edu.department || ""}
                              onChange={(e) => handleUpdateEducation(edu.id, "department", e.target.value)}
                              className="mt-1"
                              placeholder="学科を入力"
                            />
                            {educationErrors[edu.id]?.department && (
                              <p className="text-red-500 text-xs mt-1">{educationErrors[edu.id].department}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">学習内容</Label>
                          <Textarea
                            value={edu.study_details || ""}
                            onChange={(e) => handleUpdateEducation(edu.id, "study_details", e.target.value)}
                            className="mt-1"
                            placeholder="専攻・研究内容・主要科目など"
                            rows={3}
                          />
                          {educationErrors[edu.id]?.study_details && (
                            <p className="text-red-500 text-xs mt-1">{educationErrors[edu.id].study_details}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">職歴</h3>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddWorkExperience}>
                      <Plus className="h-4 w-4 mr-2" />
                      追加
                    </Button>
                  </div>
                  {newWorkExperience.map((work) => (
                    <Card key={work.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveWorkExperience(work.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">入社日 *</Label>
                            <Input
                              type="date"
                              value={work.start_date}
                              onChange={(e) => handleUpdateWorkExperience(work.id, "start_date", e.target.value)}
                              className="mt-1"
                            />
                            {workErrors[work.id]?.start_date && (
                              <p className="text-red-500 text-xs mt-1">{workErrors[work.id].start_date}</p>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-medium">退職日</Label>
                            <Input
                              type="date"
                              value={work.end_date || ""}
                              onChange={(e) => handleUpdateWorkExperience(work.id, "end_date", e.target.value || null)}
                              className="mt-1"
                            />
                            {workErrors[work.id]?.end_date && (
                              <p className="text-red-500 text-xs mt-1">{workErrors[work.id].end_date}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">会社名 *</Label>
                          <Input
                            value={work.company_name}
                            onChange={(e) => handleUpdateWorkExperience(work.id, "company_name", e.target.value)}
                            className="mt-1"
                            placeholder="会社名を入力"
                          />
                          {workErrors[work.id]?.company_name && (
                            <p className="text-red-500 text-xs mt-1">{workErrors[work.id].company_name}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-medium">業務内容 *</Label>
                          <Textarea
                            value={work.job_details}
                            onChange={(e) => handleUpdateWorkExperience(work.id, "job_details", e.target.value)}
                            className="mt-1"
                            placeholder="担当業務・成果など"
                            rows={4}
                          />
                          {workErrors[work.id]?.job_details && (
                            <p className="text-red-500 text-xs mt-1">{workErrors[work.id].job_details}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleAddCandidate}>追加</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            検索・フィルター
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              {/* First row: Keyword search, Assigned CA, Nationality, Selection status */}
              <div className="grid gap-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">キーワード</label>
                  <Input
                    placeholder="名前・メモ・職種・勤務地・国籍で検索"
                    value={filter.q}
                    onChange={(e) => setFilter({ ...filter, q: e.target.value })}
                    data-testid="candidate-filter-q"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">担当CA</label>
                  <Select
                    value={filter.caId || "none"}
                    onValueChange={(value) => setFilter({ ...filter, caId: value === "none" ? undefined : value })}
                  >
                    <SelectTrigger data-testid="candidate-filter-ca">
                      <SelectValue placeholder="全員" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">全員</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">国籍</label>
                  <Select
                    value={filter.nationality || "none"}
                    onValueChange={(value) =>
                      setFilter({ ...filter, nationality: value === "none" ? undefined : value })
                    }
                  >
                    <SelectTrigger data-testid="candidate-filter-nationality">
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">すべて</SelectItem>
                      {nationalities.map((nationality) => (
                        <SelectItem key={nationality} value={nationality}>
                          {nationality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">選考ステータス</label>
                  <Select
                    value={filter.status || "none"}
                    onValueChange={(value) => setFilter({ ...filter, status: value === "none" ? undefined : value })}
                  >
                    <SelectTrigger data-testid="candidate-filter-status">
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">すべて</SelectItem>
                      <SelectItem value="面談前">面談前</SelectItem>
                      <SelectItem value="CA面談">CA面談</SelectItem>
                      <SelectItem value="書類選考">書類選考</SelectItem>
                      <SelectItem value="面接選考">面接選考</SelectItem>
                      <SelectItem value="内定">内定</SelectItem>
                      <SelectItem value="決定">決定</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Second row: Desired job type, Desired work location, Base date, Period */}
              <div className="grid gap-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">希望職種</label>
                  <Select
                    value={filter.jobType || "none"}
                    onValueChange={(value) => setFilter({ ...filter, jobType: value === "none" ? undefined : value })}
                  >
                    <SelectTrigger data-testid="candidate-filter-job-type">
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">すべて</SelectItem>
                      {jobTypes.map((jobType) => (
                        <SelectItem key={jobType} value={jobType}>
                          {jobType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">希望勤務地</label>
                  <Select
                    value={filter.workLocation || "none"}
                    onValueChange={(value) =>
                      setFilter({ ...filter, workLocation: value === "none" ? undefined : value })
                    }
                  >
                    <SelectTrigger data-testid="candidate-filter-work-location">
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">すべて</SelectItem>
                      {workLocations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">基準日</label>
                  <Select value={filter.basis} onValueChange={(value: Basis) => setFilter({ ...filter, basis: value })}>
                    <SelectTrigger data-testid="candidate-filter-date-basis">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lastContact">最終連絡日</SelectItem>
                      <SelectItem value="created">登録日</SelectItem>
                      <SelectItem value="statusUpdated">ステータス更新日</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">期間</label>
                  <Select
                    value={filter.period}
                    onValueChange={(value: Period) => setFilter({ ...filter, period: value })}
                  >
                    <SelectTrigger data-testid="candidate-filter-period">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">制約なし</SelectItem>
                      <SelectItem value="today">今日</SelectItem>
                      <SelectItem value="thisWeek">今週</SelectItem>
                      <SelectItem value="thisMonth">今月</SelectItem>
                      <SelectItem value="custom">任意期間</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filter.period === "custom" && (
                <div className="grid gap-1 grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">開始日</label>
                    <Input
                      type="date"
                      value={filter.from || ""}
                      onChange={(e) => setFilter({ ...filter, from: e.target.value })}
                      data-testid="candidate-filter-from"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">終了日</label>
                    <Input
                      type="date"
                      value={filter.to || ""}
                      onChange={(e) => setFilter({ ...filter, to: e.target.value })}
                      data-testid="candidate-filter-to"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button onClick={applyFilters} data-testid="candidate-filter-apply">
                  適用
                </Button>
                <Button variant="outline" onClick={resetFilters} data-testid="candidate-filter-reset">
                  リセット
                </Button>
              </div>
            </div>

            {/* Search bar - full width on top */}
            {/* <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="名前で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div> */}

            {/* Filter dropdowns - responsive grid */}
            {/* <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">国籍</label>
                <Select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="すべて" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">性別</label>
                <Select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="すべて" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="男性">男性</SelectItem>
                    <SelectItem value="女性">女性</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">年齢</label>
                <Select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="すべて" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="20-25">20-25歳</SelectItem>
                    <SelectItem value="26-30">26-30歳</SelectItem>
                    <SelectItem value="31-35">31-35歳</SelectItem>
                    <SelectItem value="36+">36歳以上</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">希望職種</label>
                <Select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="すべて" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    {jobs.map((job) => (
                      <SelectItem key={job} value={job}>
                        {job}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">希望勤務地</label>
                <Select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="すべて" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">ステータス</label>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="すべて" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-start">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setCountryFilter("all")
                  setGenderFilter("all")
                  setAgeFilter("all")
                  setJobFilter("all")
                  setLocationFilter("all")
                  setStatusFilter("all")
                }}
              >
                フィルターをリセット
              </Button>
            </div> */}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>求職者一覧</CardTitle>
          <CardDescription>
            {user?.role === "ca_staff" && "あなたが担当するページの求職者のみ表示されています"}
            {user?.role === "ca_manager" && "あなたと管理対象CAが担当するページの求職者が表示されています"}
            {user?.role === "admin" && "全ての求職者が表示されています"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>求職者No</TableHead>
                <TableHead>求職者</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>Facebook連携</TableHead>
                <TableHead>担当CA</TableHead>
                <TableHead>最終連絡</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.length === 0 ? (
                <TableRow data-testid="no-data-row">
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    データがありません
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate) => (
                  <TableRow
                    key={candidate.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setInternalSelectedCandidateId(candidate.id)}
                    onDoubleClick={() => setInternalSelectedCandidateId(candidate.id)}
                  >
                    <TableCell className="font-medium">{candidate.candidateNo}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={candidate.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{candidate.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {candidate.country} • {candidate.gender} • {candidate.age}歳
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={candidate.candidateStatus === "面談前" ? "secondary" : "default"}>
                          {candidate.candidateStatus}
                        </Badge>
                        <Badge
                          variant={candidate.status === "active" ? "default" : "outline"}
                          className={
                            candidate.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {candidate.status === "active" ? "Active" : "Pre-registered"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {candidate.facebook_user_id ? (
                          <Badge variant="default" className="bg-blue-100 text-blue-800">
                            連携済み
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                              未連携
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleLinkFacebook(candidate)
                              }}
                            >
                              <LinkIcon className="h-3 w-3 mr-1" />
                              連携
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{candidate.assignedCA}</TableCell>
                    <TableCell>{candidate.lastContact}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isLinkFacebookOpen} onOpenChange={setIsLinkFacebookOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Facebook連携</DialogTitle>
            <DialogDescription>
              {selectedCandidateForLink?.name} のFacebook User IDを入力してください。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="facebook-user-id">Facebook User ID</Label>
              <Input id="facebook-user-id" placeholder="fb_123456789" />
              <p className="text-xs text-muted-foreground">
                Facebook User IDを入力すると、求職者のステータスが「Active」に変更されます。
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Facebook User IDの取得方法:</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• メッセージ受信時に自動取得</li>
                    <li>• Facebook Graph APIから取得</li>
                    <li>• 手動でIDを入力</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkFacebookOpen(false)}>
              キャンセル
            </Button>
            <Button
              onClick={() => {
                const input = document.getElementById("facebook-user-id") as HTMLInputElement
                handleFacebookLinkSubmit(input?.value || "")
              }}
            >
              連携する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { Candidates }

interface CandidateDetailProps {
  candidateId: string | null
  onBack: () => void
}
