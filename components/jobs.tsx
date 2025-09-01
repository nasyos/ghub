"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Search, Plus, Edit, Copy, Trash2, Send, ChevronDown, X, Download, Upload, FileText } from "lucide-react"
import { publish } from "@/lib/event-bus"
import { useAuth } from "@/contexts/auth-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { PartnerSelectorModal } from "@/components/partner-selector-modal"
import { Partner } from "@/lib/partners/types"

const mockJobs = [
  {
    id: "JOB001",
    company: "株式会社ABC介護",
    title: "介護職員",
    location: { pref: "東京都", city: "新宿区", address: "", station: "" },
    salary: { min: 220000, max: 280000 },
    visa: {
      types: ["tokutei-1-care"],
      jlpt: "N2",
      nationalities: [],
      certificates: [],
      procedure: "",
      procedureDeadline: "",
      supportNotes: "",
    },
    priority: "A",
    status: "published",
    updatedAt: "2024-01-15",
    description: "",
    requirements: { must: [], nice: [] },
    notes: "",
    work: { hours: "" },
    holidays: "",
    overtime: { avgHours: 0, fixed: false },
    source: "form",
    internalMemo: "",
  },
  {
    id: "JOB002",
    company: "DEF建設株式会社",
    title: "建設作業員",
    location: { pref: "大阪府", city: "大阪市", address: "", station: "" },
    salary: { min: 250000, max: 320000 },
    visa: {
      types: ["tokutei-1-construction"],
      jlpt: "N3",
      nationalities: [],
      certificates: [],
      procedure: "",
      procedureDeadline: "",
      supportNotes: "",
    },
    priority: "B",
    status: "draft",
    updatedAt: "2024-01-14",
    description: "",
    requirements: { must: [], nice: [] },
    notes: "",
    work: { hours: "" },
    holidays: "",
    overtime: { avgHours: 0, fixed: false },
    source: "form",
    internalMemo: "",
  },
  {
    id: "JOB003",
    company: "GHI製造株式会社",
    title: "製造オペレーター",
    location: { pref: "愛知県", city: "名古屋市", address: "", station: "" },
    salary: { min: 200000, max: 250000 },
    visa: {
      types: ["tokutei-1-manufacturing"],
      jlpt: "N4",
      nationalities: [],
      certificates: [],
      procedure: "",
      procedureDeadline: "",
      supportNotes: "",
    },
    priority: "C",
    status: "published",
    updatedAt: "2024-01-13",
    description: "",
    requirements: { must: [], nice: [] },
    notes: "",
    work: { hours: "" },
    holidays: "",
    overtime: { avgHours: 0, fixed: false },
    source: "form",
    internalMemo: "",
  },
  {
    id: "JOB004",
    company: "JKL農業協同組合",
    title: "農業作業員",
    location: { pref: "北海道", city: "札幌市", address: "", station: "" },
    salary: { min: 180000, max: 220000 },
    visa: {
      types: ["tokutei-1-agriculture"],
      jlpt: "N3",
      nationalities: [],
      certificates: [],
      procedure: "",
      procedureDeadline: "",
      supportNotes: "",
    },
    priority: "A",
    status: "filled",
    updatedAt: "2024-01-12",
    description: "",
    requirements: { must: [], nice: [] },
    notes: "",
    work: { hours: "" },
    holidays: "",
    overtime: { avgHours: 0, fixed: false },
    source: "form",
    internalMemo: "",
  },
]

const statusLabels = {
  draft: "下書き",
  published: "公開中",
  filled: "充足",
  paused: "停止中",
}

const statusColors = {
  draft: "secondary",
  published: "default",
  filled: "destructive",
  paused: "outline",
} as const

const priorityColors = {
  A: "destructive",
  B: "default",
  C: "secondary",
} as const

const visaTypeLabels = {
  "tokutei-1-care": "特定技能1号（介護）",
  "tokutei-1-construction": "特定技能1号（建設）",
  "tokutei-1-manufacturing": "特定技能1号（製造）",
  "tokutei-1-agriculture": "特定技能1号（農業）",
  "tokutei-1-food": "特定技能1号（外食）",
  "tokutei-1-cleaning": "特定技能1号（清掃）",
  "tokutei-1-hotel": "特定技能1号（宿泊）",
} as const

interface JobFormData {
  jobId: string
  company: string
  title: string
  employmentType: string
  prefecture: string
  city: string
  location: string
  nearestStation: string
  positions: number
  startDate: string
  recruitmentDeadline: string
  salaryMin: number
  salaryMax: number
  socialInsurance: boolean
  welfare: string
  visaStatus: string
  jlptLevel: string
  supportMemo: string
  jobDescription: string
  requiredQualifications: string[]
  preferredQualifications: string[]
  workingHours: string
  holidays: string
  status: string
  priority: string
  recruitmentSource: string
  internalMemo: string

  // Custom Fields
  customFields: { label: string; value: string }[]
}

interface DistributionPreview {
  id: string
  title: string
  body: string
  targetPlace?: string
  relatedJobId: string
  updatedAt: Date
}

interface DistributionPattern {
  id: string
  parentJobId: string
  title: string
  body: string
  targetPlace?: string
  updatedAt: Date
}

interface JobsProps {
  onNavigate?: (path: string) => void
  onNavigateToSelection?: (jobId: string) => void
  onNavigateToPipeline?: (jobId: string) => void
}

export default function Jobs({ onNavigate, onNavigateToSelection, onNavigateToPipeline }: JobsProps) {
  const { canSeePage } = useAuth()

  const [currentView, setCurrentView] = useState<"list" | "form" | "detail">("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [salaryMinFilter, setSalaryMinFilter] = useState<string>("")
  const [salaryMaxFilter, setSalaryMaxFilter] = useState<string>("")
  const [visaFilter, setVisaFilter] = useState<string>("all")
  const [jlptFilter, setJlptFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [editingJobId, setEditingJobId] = useState<string | null>(null)
  const [viewingJobId, setViewingJobId] = useState<string | null>(null)

  const [distributionPreviews, setDistributionPreviews] = useState<DistributionPreview[]>([])
  const [distributionPatterns, setDistributionPatterns] = useState<DistributionPattern[]>([])
  const [showCreateChildJob, setShowCreateChildJob] = useState(false)
  const [editingPreview, setEditingPreview] = useState<string | null>(null)
  const [editingPattern, setEditingPattern] = useState<string | null>(null)
  const [previewForm, setPreviewForm] = useState({ title: "", body: "", targetPlace: "" })
  const [patternForm, setPatternForm] = useState({ title: "", body: "", targetPlace: "" })
  const [previewErrors, setPreviewErrors] = useState<{ title?: string; body?: string }>({})
  const [patternErrors, setPatternErrors] = useState<{ title?: string; body?: string }>({})

  const [formData, setFormData] = useState<JobFormData>({
    jobId: `JOB${String(Date.now()).slice(-6)}`,
    company: "",
    title: "",
    employmentType: "",
    prefecture: "",
    city: "",
    location: "",
    nearestStation: "",
    positions: 1,
    startDate: "",
    recruitmentDeadline: "",
    salaryMin: 0,
    salaryMax: 0,
    socialInsurance: false,
    welfare: "",
    visaStatus: "",
    jlptLevel: "",
    supportMemo: "",
    jobDescription: "",
    requiredQualifications: [""],
    preferredQualifications: [""],
    workingHours: "",
    holidays: "",
    status: "公開中",
    priority: "B",
    recruitmentSource: "form",
    internalMemo: "",
    customFields: [],
  })

  const [openSections, setOpenSections] = useState({
    basic: true,
    salary: true,
    visa: true,
    job: true,
    schedule: true,
    operation: true,
    custom: true,
  })

  const [csvImportDialogOpen, setCsvImportDialogOpen] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [partnerSelectorOpen, setPartnerSelectorOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)

  const resetFilters = () => {
    setSearchTerm("")
    setLocationFilter("all")
    setSalaryMinFilter("")
    setSalaryMaxFilter("")
    setVisaFilter("all")
    setJlptFilter("all")
    setPriorityFilter("all")
  }

  const handlePartnerSelect = (partner: Partner) => {
    setSelectedPartner(partner)
    setFormData(prev => ({ ...prev, company: partner.name }))
  }

  const uniqueCompanies = Array.from(new Set(mockJobs.map((job) => job.company)))
  const uniqueLocations = Array.from(new Set(mockJobs.map((job) => `${job.location.pref} ${job.location.city}`)))
  const uniqueVisaTypes = Array.from(new Set(mockJobs.map((job) => job.visa.types[0])))
  const uniqueJlptLevels = Array.from(new Set(mockJobs.map((job) => job.visa.jlpt)))

  const handleNewJob = () => {
    setEditingJobId(null)
    setFormData({
      jobId: `JOB${String(Date.now()).slice(-6)}`,
      company: "",
      title: "",
      employmentType: "",
      prefecture: "",
      city: "",
      location: "",
      nearestStation: "",
      positions: 1,
      startDate: "",
      recruitmentDeadline: "",
      salaryMin: 0,
      salaryMax: 0,
      socialInsurance: false,
      welfare: "",
      visaStatus: "",
      jlptLevel: "",
      supportMemo: "",
      jobDescription: "",
      requiredQualifications: [""],
      preferredQualifications: [""],
      workingHours: "",
      holidays: "",
      status: "公開中",
      priority: "B",
      recruitmentSource: "form",
      internalMemo: "",
      customFields: [],
    })
    setCurrentView("form")
  }

  const handleEditJob = (jobId: string) => {
    setEditingJobId(jobId)
    // In a real app, you would fetch the job data here
    setCurrentView("form")
  }

  const handleViewJob = (jobId: string) => {
    setViewingJobId(jobId)
    setCurrentView("detail")
  }

  const handleBackToList = () => {
    setCurrentView("list")
    setEditingJobId(null)
    setViewingJobId(null)
  }

  const handleSaveJob = () => {
    // Here you would typically save to your backend
    handleBackToList()
  }

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const addQualification = (type: "requiredQualifications" | "preferredQualifications") => {
    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], ""],
    }))
  }

  const updateQualification = (type: "requiredQualifications" | "preferredQualifications", index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].map((qual, i) => (i === index ? value : qual)),
    }))
  }

  const removeQualification = (type: "requiredQualifications" | "preferredQualifications", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }))
  }

  const addCustomField = () => {
    setFormData((prev) => ({
      ...prev,
      customFields: [...prev.customFields, { label: "", value: "" }],
    }))
  }

  const updateCustomField = (index: number, field: "label" | "value", value: string) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.map((customField, i) =>
        i === index ? { ...customField, [field]: value } : customField,
      ),
    }))
  }

  const removeCustomField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
    }))
  }

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.pref.includes(searchTerm) ||
      job.location.city.includes(searchTerm)

    const matchesLocation = locationFilter === "all" || `${job.location.pref} ${job.location.city}` === locationFilter
    const matchesVisa = visaFilter === "all" || job.visa.types[0] === visaFilter
    const matchesJlpt = jlptFilter === "all" || job.visa.jlpt === jlptFilter
    const matchesPriority = priorityFilter === "all" || job.priority === priorityFilter

    const matchesSalaryMin = !salaryMinFilter || job.salary.min >= Number.parseInt(salaryMinFilter)
    const matchesSalaryMax = !salaryMaxFilter || job.salary.max <= Number.parseInt(salaryMaxFilter)

    return (
      matchesSearch &&
      matchesLocation &&
      matchesVisa &&
      matchesJlpt &&
      matchesPriority &&
      matchesSalaryMin &&
      matchesSalaryMax
    )
  })

  const downloadCsvTemplate = () => {
    const headers = [
      "job_id",
      "company_name",
      "title",
      "employment_type",
      "prefecture",
      "city",
      "address",
      "openings",
      "start_date",
      "end_date",
      "salary_min",
      "salary_max",
      "status",
      "priority",
      "jlpt",
      "visa_types",
      "description",
      "requirements_must",
      "requirements_nice",
      "work_days",
      "work_hours",
      "holidays",
      "updated_at",
    ]

    const csvContent = headers.join(",") + "\n"
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "job_template.csv"
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const exportJobsCsv = () => {
    const headers = [
      "job_id",
      "company_name",
      "title",
      "employment_type",
      "prefecture",
      "city",
      "address",
      "openings",
      "start_date",
      "end_date",
      "salary_min",
      "salary_max",
      "status",
      "priority",
      "jlpt",
      "visa_types",
      "description",
      "requirements_must",
      "requirements_nice",
      "work_days",
      "work_hours",
      "holidays",
      "updated_at",
    ]

    const csvRows = [headers.join(",")]

    filteredJobs.forEach((job) => {
      const row = [
        job.id,
        `"${job.company}"`,
        `"${job.title}"`,
        "", // employment_type
        job.location.pref,
        job.location.city,
        `"${job.location.address}"`,
        "", // openings
        "", // start_date
        "", // end_date
        job.salary.min,
        job.salary.max,
        job.status,
        job.priority,
        job.visa.jlpt,
        `"${job.visa.types.join(";")}"`,
        `"${job.description}"`,
        `"${job.requirements.must.join(";")}"`,
        `"${job.requirements.nice.join(";")}"`,
        "", // work_days
        `"${job.work.hours}"`,
        `"${job.holidays}"`,
        job.updatedAt,
      ]
      csvRows.push(row.join(","))
    })

    const csvContent = csvRows.join("\n")
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `jobs_export_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const handleCsvImport = () => {
    if (!csvFile) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string
        const lines = csvText.split("\n").filter((line) => line.trim())
        const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

        let updatedCount = 0
        let addedCount = 0
        const errors: string[] = []

        const updatedJobs = [...mockJobs]

        for (let i = 1; i < lines.length; i++) {
          try {
            const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
            const jobData: any = {}

            headers.forEach((header, index) => {
              jobData[header] = values[index] || ""
            })

            // Validate required fields
            if (!jobData.job_id || !jobData.company_name || !jobData.title || !jobData.prefecture) {
              errors.push(`行 ${i + 1}: 必須項目が不足しています`)
              continue
            }

            // Find existing job
            const existingIndex = updatedJobs.findIndex((job) => job.id === jobData.job_id)

            const jobObject = {
              id: jobData.job_id,
              company: jobData.company_name,
              title: jobData.title,
              location: {
                pref: jobData.prefecture,
                city: jobData.city || "",
                address: jobData.address || "",
                station: "",
              },
              salary: {
                min: Number.parseInt(jobData.salary_min) || 0,
                max: Number.parseInt(jobData.salary_max) || 0,
              },
              visa: {
                types: jobData.visa_types ? jobData.visa_types.split(";") : [],
                jlpt: jobData.jlpt || "N5",
                nationalities: [],
                certificates: [],
                procedure: "",
                procedureDeadline: "",
                supportNotes: "",
              },
              priority: jobData.priority || "C",
              status: jobData.status || "draft",
              updatedAt: jobData.updated_at || new Date().toISOString().split("T")[0],
              description: jobData.description || "",
              requirements: {
                must: jobData.requirements_must ? jobData.requirements_must.split(";") : [],
                nice: jobData.requirements_nice ? jobData.requirements_nice.split(";") : [],
              },
              notes: "",
              work: { hours: jobData.work_hours || "" },
              holidays: jobData.holidays || "",
              overtime: { avgHours: 0, fixed: false },
              source: "csv",
              internalMemo: "",
            }

            if (existingIndex >= 0) {
              updatedJobs[existingIndex] = jobObject
              updatedCount++
            } else {
              updatedJobs.push(jobObject)
              addedCount++
            }
          } catch (error) {
            errors.push(`行 ${i + 1}: データ形式エラー`)
          }
        }

        // Update the jobs (in real app, this would update the state)
        // For now, just show success message

        if (errors.length > 0) {
          toast.error(`インポートエラー: ${errors.join(", ")}`)
        } else {
          toast.success(`インポートが完了しました（上書き ${updatedCount} 件／追加 ${addedCount} 件）`)
        }

        setCsvImportDialogOpen(false)
        setCsvFile(null)
      } catch (error) {
        toast.error("CSVファイルの読み込みに失敗しました")
      }
    }
    reader.readAsText(csvFile, "UTF-8")
  }

  const handleCreateDistributionPreview = (jobId: string, initialContent?: string) => {
    const job = mockJobs.find((job) => job.id === jobId)
    const newPreview: DistributionPreview = {
      id: `preview-${Date.now()}`,
      title: "",
      body:
        initialContent ||
        `${job?.company} ${job?.title}\n\n月給: ¥${job?.salary.min.toLocaleString()} - ¥${job?.salary.max.toLocaleString()}\n勤務地: ${job?.location.pref}${job?.location.city}`,
      targetPlace: "",
      relatedJobId: jobId,
      updatedAt: new Date(),
    }
    setDistributionPreviews([...distributionPreviews, newPreview])
    setEditingPreview(newPreview.id)
    setPreviewForm({ title: newPreview.title, body: newPreview.body, targetPlace: newPreview.targetPlace || "" })
  }

  const handleSaveDistributionPreview = (previewId: string) => {
    const errors: { title?: string; body?: string } = {}

    if (!previewForm.title.trim()) {
      errors.title = "タイトルは必須です"
    } else if (previewForm.title.length > 100) {
      errors.title = "タイトルは100文字以内で入力してください"
    }

    if (!previewForm.body.trim()) {
      errors.body = "本文は必須です"
    } else if (previewForm.body.length > 5000) {
      errors.body = "本文は5000文字以内で入力してください"
    }

    setPreviewErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    setDistributionPreviews((prev) =>
      prev.map((p) =>
        p.id === previewId
          ? {
              ...p,
              title: previewForm.title,
              body: previewForm.body,
              targetPlace: previewForm.targetPlace,
              updatedAt: new Date(),
            }
          : p,
      ),
    )
    setEditingPreview(null)
    setPreviewForm({ title: "", body: "", targetPlace: "" })
    setPreviewErrors({})

    // Show success toast
    console.log("[v0] 保存しました")
  }

  const handleCopyDistributionPreview = async (preview: DistributionPreview) => {
    const copyText = `${preview.title}\n\n${preview.body}\n\n求人No ${preview.relatedJobId}`

    try {
      await navigator.clipboard.writeText(copyText)
      console.log("[v0] コピーしました")

      toast.success("テンプレをコピーしました", {
        action: canSeePage?.("communities")
          ? {
              label: "コミュニティを開く",
              onClick: () => {
                publish({
                  type: "OPEN_COMMUNITIES_WITH",
                  payload: { keyword: preview.title, scroll: true },
                })
                localStorage.setItem("community_prefill", JSON.stringify({ keyword: preview.title }))
                onNavigate?.("communities")
              },
            }
          : undefined,
      })
    } catch (err) {
      console.error("[v0] コピーに失敗しました:", err)
      toast.error("コピーに失敗しました")
    }
  }

  const handleDeleteDistributionPreview = (previewId: string) => {
    setDistributionPreviews((prev) => prev.filter((p) => p.id !== previewId))
    if (editingPreview === previewId) {
      setEditingPreview(null)
      setPreviewForm({ title: "", body: "", targetPlace: "" })
      setPreviewErrors({})
    }
  }

  const handleCreateDistributionPattern = (parentJob: JobFormData) => {
    const existingPatternCount = distributionPatterns.filter((pattern) => pattern.parentJobId === parentJob.id).length
    const patternId = `${parentJob.jobId}-${String(existingPatternCount + 1).padStart(3, "0")}`

    // Find the latest distribution preview for this job
    const latestPreview = distributionPreviews
      .filter((p) => p.relatedJobId === parentJob.id)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0]

    const newPattern: DistributionPattern = {
      id: patternId,
      parentJobId: parentJob.id,
      title: latestPreview?.title || `${parentJob.company} ${parentJob.title}`,
      body:
        latestPreview?.body ||
        `${parentJob.company} ${parentJob.title}\n\n月給: ¥${parentJob.salaryMin?.toLocaleString()} - ¥${parentJob.salaryMax?.toLocaleString()}\n勤務地: ${parentJob.location.pref}${parentJob.location.city}`,
      targetPlace: "",
      updatedAt: new Date(),
    }

    setDistributionPatterns([...distributionPatterns, newPattern])
    setEditingPattern(newPattern.id)
    setPatternForm({ title: newPattern.title, body: newPattern.body, targetPlace: newPattern.targetPlace || "" })

    console.log("[v0] 配布用求人パターンを作成しました:", patternId)
  }

  const handleSaveDistributionPattern = (patternId: string) => {
    const errors: { title?: string; body?: string } = {}

    if (!patternForm.title.trim()) {
      errors.title = "タイトルは必須です"
    } else if (patternForm.title.length > 100) {
      errors.title = "タイトルは100文字以内で入力してください"
    }

    if (!patternForm.body.trim()) {
      errors.body = "本文は必須です"
    } else if (patternForm.body.length > 5000) {
      errors.body = "本文は5000文字以内で入力してください"
    }

    setPatternErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    setDistributionPatterns((prev) =>
      prev.map((p) =>
        p.id === patternId
          ? {
              ...p,
              title: patternForm.title,
              body: patternForm.body,
              targetPlace: patternForm.targetPlace,
              updatedAt: new Date(),
            }
          : p,
      ),
    )

    setEditingPattern(null)
    setPatternForm({ title: "", body: "", targetPlace: "" })
    setPatternErrors({})
    console.log("[v0] 配布用求人パターンを保存しました")
  }

  const handleCopyDistributionPattern = async (pattern: DistributionPattern) => {
    const copyText = `${pattern.title}\n\n${pattern.body}`

    try {
      await navigator.clipboard.writeText(copyText)
      console.log("[v0] 配布用求人パターンをコピーしました")

      toast.success("テンプレをコピーしました", {
        action: canSeePage?.("communities")
          ? {
              label: "コミュニティを開く",
              onClick: () => {
                publish({
                  type: "OPEN_COMMUNITIES_WITH",
                  payload: { keyword: pattern.title, scroll: true },
                })
                localStorage.setItem("community_prefill", JSON.stringify({ keyword: pattern.title }))
                onNavigate?.("communities")
              },
            }
          : undefined,
      })
    } catch (err) {
      console.error("[v0] コピーに失敗しました:", err)
      toast.error("コピーに失敗しました")
    }
  }

  const handleEditDistributionPattern = (pattern: DistributionPattern) => {
    setEditingPattern(pattern.id)
    setPatternForm({ title: pattern.title, body: pattern.body, targetPlace: pattern.targetPlace || "" })
  }

  const handleDeleteDistributionPattern = (patternId: string) => {
    if (window.confirm("この配布用求人パターンを削除しますか？")) {
      setDistributionPatterns((prev) => prev.filter((pattern) => pattern.id !== patternId))
      console.log("[v0] 配布用求人パターンを削除しました:", patternId)
    }
  }

  const handleCopyChildJob = async (childJob: any) => {
    const latestPreview = distributionPreviews
      .filter((p) => p.relatedJobId === childJob.id)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0]

    const copyText = latestPreview
      ? `${latestPreview.title}\n\n${latestPreview.body}\n\n求人No ${childJob.id}`
      : `${childJob.company} ${childJob.title}\n\n月給: ¥${childJob.salaryMin?.toLocaleString()} - ¥${childJob.salaryMax?.toLocaleString()}\n\n求人No ${childJob.id}`

    try {
      await navigator.clipboard.writeText(copyText)
      console.log("[v0] 子求人をコピーしました")

      toast.success("テンプレをコピーしました", {
        action: canSeePage?.("communities")
          ? {
              label: "コミュニティを開く",
              onClick: () => {
                const jobTitle = latestPreview?.title || childJob.title
                publish({
                  type: "OPEN_COMMUNITIES_WITH",
                  payload: { keyword: jobTitle, scroll: true },
                })
                localStorage.setItem("community_prefill", JSON.stringify({ keyword: jobTitle }))
                onNavigate?.("communities")
              },
            }
          : undefined,
      })
    } catch (err) {
      console.error("[v0] コピーに失敗しました:", err)
      toast.error("コピーに失敗しました")
    }
  }

  const handleEditChildJob = (childJob: any) => {
    setEditingJobId(childJob.id)
    setFormData(childJob)
    setCurrentView("form")
  }

  const handleDeleteChildJob = (childJobId: string) => {
    if (window.confirm("この子求人を削除しますか？")) {
      // setChildJobs((prev) => prev.filter((child) => child.id !== childJobId))
      // Remove from mockJobs array as well
      const index = mockJobs.findIndex((job) => job.id === childJobId)
      if (index > -1) {
        mockJobs.splice(index, 1)
      }
      // Remove related distribution previews
      setDistributionPreviews((prev) => prev.filter((p) => p.relatedJobId !== childJobId))
      console.log("[v0] 子求人を削除しました:", childJobId)
    }
  }

  if (currentView === "form") {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={handleBackToList} className="px-2">
            ← 戻る
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">
            {editingJobId ? `求人編集 (${editingJobId})` : "求人作成"}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Basic Information */}
            <Collapsible open={openSections.basic} onOpenChange={() => toggleSection("basic")}>
              <Card className="shadow-sm">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between text-lg">
                      1. 基本情報
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${openSections.basic ? "rotate-180" : ""}`}
                      />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="jobId">求人ID *</Label>
                        <Input
                          id="jobId"
                          value={formData.jobId}
                          onChange={(e) => setFormData((prev) => ({ ...prev, jobId: e.target.value }))}
                          placeholder="JOB001"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">企業名 *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="company"
                            value={formData.company}
                            onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                            placeholder="企業を選択してください"
                            className="h-10 flex-1"
                            readOnly
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPartnerSelectorOpen(true)}
                            className="h-10"
                          >
                            企業選択
                          </Button>
                        </div>
                        {selectedPartner && (
                          <div className="text-sm text-muted-foreground">
                            選択中: {selectedPartner.name} ({selectedPartner.department || "部署未設定"})
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">職種 *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="介護職員"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employmentType">雇用形態 *</Label>
                        <Select
                          value={formData.employmentType}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, employmentType: value }))}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="選択してください" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="正社員">正社員</SelectItem>
                            <SelectItem value="契約社員">契約社員</SelectItem>
                            <SelectItem value="パート・アルバイト">パート・アルバイト</SelectItem>
                            <SelectItem value="派遣社員">派遣社員</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Additional form sections would continue here... */}

            {/* Section 2: Salary & Conditions */}
            <Collapsible open={openSections.salary} onOpenChange={() => toggleSection("salary")}>
              <Card className="shadow-sm">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between text-lg">
                      2. 待遇・条件
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${openSections.salary ? "rotate-180" : ""}`}
                      />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="salaryMin">月給最低額 *</Label>
                        <Input
                          id="salaryMin"
                          type="number"
                          value={formData.salaryMin}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, salaryMin: Number.parseInt(e.target.value) || 0 }))
                          }
                          placeholder="220000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salaryMax">月給最高額 *</Label>
                        <Input
                          id="salaryMax"
                          type="number"
                          value={formData.salaryMax}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, salaryMax: Number.parseInt(e.target.value) || 0 }))
                          }
                          placeholder="280000"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="socialInsurance"
                        checked={formData.socialInsurance}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, socialInsurance: !!checked }))}
                      />
                      <Label htmlFor="socialInsurance">社会保険 *</Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="welfare">福利厚生</Label>
                      <Textarea
                        id="welfare"
                        value={formData.welfare}
                        onChange={(e) => setFormData((prev) => ({ ...prev, welfare: e.target.value }))}
                        placeholder="福利厚生の詳細"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Section 3: Visa Status & Requirements */}
            <Collapsible open={openSections.visa} onOpenChange={() => toggleSection("visa")}>
              <Card className="shadow-sm">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between text-lg">
                      3. 在留資格・要件
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${openSections.visa ? "rotate-180" : ""}`}
                      />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="visaStatus">在留資格 *</Label>
                        <Select
                          value={formData.visaStatus}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, visaStatus: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="選択してください" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="特定技能1号 (介護)">特定技能1号 (介護)</SelectItem>
                            <SelectItem value="特定技能1号 (建設)">特定技能1号 (建設)</SelectItem>
                            <SelectItem value="技術・人文知識・国際業務">技術・人文知識・国際業務</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jlptLevel">日本語要件 *</Label>
                        <Select
                          value={formData.jlptLevel}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, jlptLevel: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="選択してください" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="N1">JLPT N1</SelectItem>
                            <SelectItem value="N2">JLPT N2</SelectItem>
                            <SelectItem value="N3">JLPT N3</SelectItem>
                            <SelectItem value="N4">JLPT N4</SelectItem>
                            <SelectItem value="N5">JLPT N5</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportMemo">受入れ体制メモ</Label>
                      <Textarea
                        id="supportMemo"
                        value={formData.supportMemo}
                        onChange={(e) => setFormData((prev) => ({ ...prev, supportMemo: e.target.value }))}
                        placeholder="寮の有無、生活面のサポートなど"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Section 4: Job Content & Application Requirements */}
            <Collapsible open={openSections.job} onOpenChange={() => toggleSection("job")}>
              <Card className="shadow-sm">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between text-lg">
                      4. 仕事内容・応募資格
                      <ChevronDown className={`h-4 w-4 transition-transform ${openSections.job ? "rotate-180" : ""}`} />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6 pt-0">
                    <div>
                      <Label htmlFor="jobDescription">仕事内容 *</Label>
                      <Textarea
                        id="jobDescription"
                        value={formData.jobDescription}
                        onChange={(e) => setFormData((prev) => ({ ...prev, jobDescription: e.target.value }))}
                        placeholder="具体的な仕事内容を記載"
                        rows={4}
                        className="mt-2"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>応募必須要件 *</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => addQualification("requiredQualifications")}>
                          + 追加
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {formData.requiredQualifications.map((qual, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={qual}
                              onChange={(e) => updateQualification("requiredQualifications", index, e.target.value)}
                              placeholder="必須要件を入力"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeQualification("requiredQualifications", index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <Label>歓迎要件</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => addQualification("preferredQualifications")}>
                          + 追加
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {formData.preferredQualifications.map((qual, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={qual}
                              onChange={(e) => updateQualification("preferredQualifications", index, e.target.value)}
                              placeholder="歓迎要件を入力"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeQualification("preferredQualifications", index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Section 5: Working Hours & Holidays */}
            <Collapsible open={openSections.schedule} onOpenChange={() => toggleSection("schedule")}>
              <Card className="shadow-sm">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between text-lg">
                      5. 勤務・休日
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${openSections.schedule ? "rotate-180" : ""}`}
                      />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6 pt-0">
                    <div className="space-y-2">
                      <Label htmlFor="workingHours">勤務時間 *</Label>
                      <Input
                        id="workingHours"
                        value={formData.workingHours}
                        onChange={(e) => setFormData((prev) => ({ ...prev, workingHours: e.target.value }))}
                        placeholder="例：9:00-18:00（休憩時間）"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="holidays">休日・休暇 *</Label>
                      <Input
                        id="holidays"
                        value={formData.holidays}
                        onChange={(e) => setFormData((prev) => ({ ...prev, holidays: e.target.value }))}
                        placeholder="例：週休2日、年間110日"
                        className="h-10"
                      />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Section 6: Operation Information */}
            <Collapsible open={openSections.operation} onOpenChange={() => toggleSection("operation")}>
              <Card className="shadow-sm">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between text-lg">
                      6. 運用情報
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${openSections.operation ? "rotate-180" : ""}`}
                      />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="status">ステータス *</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">下書き</SelectItem>
                            <SelectItem value="published">公開中</SelectItem>
                            <SelectItem value="paused">停止中</SelectItem>
                            <SelectItem value="filled">充足</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">案件優先度</Label>
                        <Select
                          value={formData.priority}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="recruitmentSource">求人ソース</Label>
                        <Select
                          value={formData.recruitmentSource}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, recruitmentSource: value }))}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="form">フォーム</SelectItem>
                            <SelectItem value="phone">電話</SelectItem>
                            <SelectItem value="email">メール</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="internalMemo">社内メモ</Label>
                      <Textarea
                        id="internalMemo"
                        value={formData.internalMemo}
                        onChange={(e) => setFormData((prev) => ({ ...prev, internalMemo: e.target.value }))}
                        placeholder="社内向けメモ（非公開）"
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Section 7: Custom Fields */}
            <Collapsible open={openSections.custom} onOpenChange={() => toggleSection("custom")}>
              <Card className="shadow-sm">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between text-lg">
                      7. 任意項目
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${openSections.custom ? "rotate-180" : ""}`}
                      />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6 pt-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">カスタム項目を自由に追加できます</p>
                      <Button type="button" variant="outline" size="sm" onClick={addCustomField}>
                        + 項目追加
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {formData.customFields.map((field, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Input
                              value={field.label}
                              onChange={(e) => updateCustomField(index, "label", e.target.value)}
                              placeholder="項目名"
                              className="h-10"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Input
                              value={field.value}
                              onChange={(e) => updateCustomField(index, "value", e.target.value)}
                              placeholder="内容"
                              className="h-10"
                            />
                            <Button type="button" variant="outline" size="sm" onClick={() => removeCustomField(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleSaveJob} className="flex-1 h-11">
                保存
              </Button>
              <Button variant="outline" onClick={handleBackToList} className="flex-1 h-11 bg-transparent">
                キャンセル
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">プレビュー</CardTitle>
                <Button variant="outline" size="sm" onClick={() => handleCreateDistributionPreview(formData.jobId)}>
                  プレビューを複製
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">求人ID: {formData.jobId || "JOB001"}</div>
                  <h3 className="font-semibold text-lg">
                    {formData.company || "企業名"} {formData.title || "職種"}
                  </h3>
                </div>
                {formData.salaryMin > 0 && formData.salaryMax > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">## 待遇</h4>
                    <p className="text-sm">
                      月給: ¥{formData.salaryMin.toLocaleString()} - ¥{formData.salaryMax.toLocaleString()}
                    </p>
                  </div>
                )}
                {(formData.prefecture || formData.city) && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">## 勤務地</h4>
                    <p className="text-sm">
                      {formData.prefecture}
                      {formData.city}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === "detail" && viewingJobId) {
    const job = mockJobs.find((j) => j.id === viewingJobId)
    if (!job) {
      setCurrentView("list")
      return null
    }

    const selectedJob = mockJobs.find((job) => job.id === viewingJobId)

    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBackToList} className="px-2">
              ← 戻る
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">求人詳細 ({job.id})</h2>
          </div>
          <div className="flex items-center gap-2">
            {canSeePage?.("pipeline") && (
              <Button
                onClick={() => onNavigateToPipeline?.(job.id)}
                data-testid="go-to-pipeline"
                aria-label="選考管理へ"
              >
                選考管理へ
              </Button>
            )}
            <Button variant="outline" onClick={() => handleEditJob(job.id)}>
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Button>
            <Button variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              複製
            </Button>
            <Button variant="outline">
              <Trash2 className="h-4 w-4 mr-2" />
              削除
            </Button>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              公開
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">1. 基本情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">求人ID</Label>
                    <p className="text-base font-medium">{job.id}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">企業名</Label>
                    <p className="text-base font-medium">{job.company}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">職種</Label>
                    <p className="text-base">{job.title}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">雇用形態</Label>
                    <p className="text-base">正社員</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">都道府県</Label>
                    <p className="text-base">{job.location.pref}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">市区</Label>
                    <p className="text-base">{job.location.city}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">住所</Label>
                    <p className="text-base">{job.location.address || "詳細住所"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">最寄駅</Label>
                    <p className="text-base">{job.location.station || "新宿駅"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">募集人数</Label>
                    <p className="text-base">1名</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">発生日</Label>
                    <p className="text-base">2024年4月1日</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">募集締切日</Label>
                    <p className="text-base">2024年3月31日</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Salary & Conditions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. 待遇・条件</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">月給最低額</Label>
                    <p className="text-base">¥{job.salary.min.toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">月給最高額</Label>
                    <p className="text-base">¥{job.salary.max.toLocaleString()}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">社会保険</Label>
                  <p className="text-base">あり</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">福利厚生</Label>
                  <p className="text-base">福利厚生の詳細</p>
                </div>
              </CardContent>
            </Card>

            {/* Visa Status & Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">3. 在留資格・要件</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">在留資格</Label>
                    <p className="text-base">
                      {visaTypeLabels[job.visa.types[0] as keyof typeof visaTypeLabels] || job.visa.types[0]}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">日本語要件</Label>
                    <p className="text-base">JLPT {job.visa.jlpt}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">受入れ体制メモ</Label>
                  <p className="text-base">{job.visa.supportNotes || "寮の有無、生活面のサポートなど"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Job Content & Application Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">4. 仕事内容・応募資格</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">仕事内容</Label>
                  <p className="text-base">{job.description || "具体的な仕事内容を記載"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">応募必須要件</Label>
                  <div className="space-y-1">
                    {job.requirements.must.length > 0 ? (
                      job.requirements.must.map((req, index) => (
                        <p key={index} className="text-base">
                          • {req}
                        </p>
                      ))
                    ) : (
                      <p className="text-base">• 必須要件なし</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">歓迎要件</Label>
                  <div className="space-y-1">
                    {job.requirements.nice.length > 0 ? (
                      job.requirements.nice.map((req, index) => (
                        <p key={index} className="text-base">
                          • {req}
                        </p>
                      ))
                    ) : (
                      <p className="text-base">• 歓迎要件なし</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Working Hours & Holidays */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">5. 勤務・休日</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">勤務時間</Label>
                  <p className="text-base">{job.work.hours || "9:00-18:00（休憩時間）"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">休日・休暇</Label>
                  <p className="text-base">{job.holidays || "週休2日、年間110日"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Operation Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">6. 運用情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">ステータス</Label>
                    <Badge variant={statusColors[job.status as keyof typeof statusColors]}>
                      {statusLabels[job.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">案件優先度</Label>
                    <Badge variant={priorityColors[job.priority as keyof typeof priorityColors]}>{job.priority}</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">求人ソース</Label>
                    <p className="text-base">{job.source === "form" ? "フォーム" : job.source}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">社内メモ</Label>
                  <p className="text-base">{job.internalMemo || "社内向けメモ（非公開）"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">求人プレビュー</CardTitle>
                <Button variant="outline" size="sm" onClick={() => handleCreateDistributionPreview(job.id)}>
                  プレビューを複製
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-2">求人ID: {job.id}</div>
                  <h3 className="font-bold text-lg mb-2">
                    {job.company} {job.title}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>## 待遇</strong>
                    </p>
                    <p>
                      月給: ¥{job.salary.min.toLocaleString()} - ¥{job.salary.max.toLocaleString()}
                    </p>
                    <p>
                      <strong>## 勤務地</strong>
                    </p>
                    <p>
                      {job.location.pref}
                      {job.location.city}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">配布用プレビュー</CardTitle>
                <Button variant="outline" size="sm" onClick={() => handleCreateDistributionPreview(job.id)}>
                  新規プレビューを追加
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {distributionPreviews.filter((p) => p.relatedJobId === job.id).length === 0 ? (
                  <p className="text-muted-foreground text-sm">配布用プレビューがありません</p>
                ) : (
                  <div className="space-y-4">
                    {distributionPreviews
                      .filter((p) => p.relatedJobId === job.id)
                      .map((preview) => (
                        <div key={preview.id} className="border rounded-lg p-4">
                          {editingPreview === preview.id ? (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor={`title-${preview.id}`}>タイトル *</Label>
                                <Input
                                  id={`title-${preview.id}`}
                                  value={previewForm.title}
                                  onChange={(e) => setPreviewForm({ ...previewForm, title: e.target.value })}
                                  placeholder="タイトルを入力（1-100文字）"
                                  className={previewErrors.title ? "border-red-500" : ""}
                                />
                                {previewErrors.title && <p className="text-red-500 text-sm">{previewErrors.title}</p>}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`body-${preview.id}`}>本文 *</Label>
                                <Textarea
                                  id={`body-${preview.id}`}
                                  value={previewForm.body}
                                  onChange={(e) => setPreviewForm({ ...previewForm, body: e.target.value })}
                                  placeholder="本文を入力（1-5000文字）"
                                  rows={8}
                                  className={previewErrors.body ? "border-red-500" : ""}
                                />
                                {previewErrors.body && <p className="text-red-500 text-sm">{previewErrors.body}</p>}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`target-${preview.id}`}>掲載場所</Label>
                                <Input
                                  id={`target-${preview.id}`}
                                  value={previewForm.targetPlace}
                                  onChange={(e) => setPreviewForm({ ...previewForm, targetPlace: e.target.value })}
                                  placeholder="掲載場所（任意）"
                                />
                              </div>

                              <div className="text-xs text-muted-foreground">求人No {preview.relatedJobId}</div>

                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleSaveDistributionPreview(preview.id)}>
                                  保存
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingPreview(null)
                                    setPreviewForm({ title: "", body: "", targetPlace: "" })
                                    setPreviewErrors({})
                                  }}
                                >
                                  キャンセル
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium">{preview.title || "（タイトル未設定）"}</h4>
                                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap line-clamp-3">
                                    {preview.body}
                                  </p>
                                  {preview.targetPlace && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                      掲載場所: {preview.targetPlace}
                                    </p>
                                  )}
                                  <p className="text-xs text-muted-foreground mt-1">
                                    求人No {preview.relatedJobId} • 更新: {preview.updatedAt.toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCopyDistributionPreview(preview)}
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  コピー
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingPreview(preview.id)
                                    setPreviewForm({
                                      title: preview.title,
                                      body: preview.body,
                                      targetPlace: preview.targetPlace || "",
                                    })
                                  }}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  編集
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteDistributionPreview(preview.id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  削除
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">子求人</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" onClick={() => handleCreateDistributionPattern(job)} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  配布用求人パターンを作成
                </Button>

                {distributionPatterns.filter((pattern) => pattern.parentJobId === job.id).length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">配布用求人パターン</h4>
                    {distributionPatterns
                      .filter((pattern) => pattern.parentJobId === job.id)
                      .map((pattern) => (
                        <div key={pattern.id} className="border rounded-lg p-4">
                          {editingPattern === pattern.id ? (
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor={`pattern-title-${pattern.id}`} className="text-sm font-medium">
                                  タイトル *
                                </Label>
                                <Input
                                  id={`pattern-title-${pattern.id}`}
                                  value={patternForm.title}
                                  onChange={(e) => setPatternForm({ ...patternForm, title: e.target.value })}
                                  className="mt-1"
                                />
                                {patternErrors.title && (
                                  <p className="text-sm text-red-600 mt-1">{patternErrors.title}</p>
                                )}
                              </div>

                              <div>
                                <Label htmlFor={`pattern-body-${pattern.id}`} className="text-sm font-medium">
                                  本文 *
                                </Label>
                                <Textarea
                                  id={`pattern-body-${pattern.id}`}
                                  value={patternForm.body}
                                  onChange={(e) => setPatternForm({ ...patternForm, body: e.target.value })}
                                  rows={6}
                                  className="mt-1"
                                />
                                {patternErrors.body && (
                                  <p className="text-sm text-red-600 mt-1">{patternErrors.body}</p>
                                )}
                              </div>

                              <div>
                                <Label htmlFor={`pattern-place-${pattern.id}`} className="text-sm font-medium">
                                  掲載場所（任意）※コピー対象外
                                </Label>
                                <Input
                                  id={`pattern-place-${pattern.id}`}
                                  value={patternForm.targetPlace}
                                  onChange={(e) => setPatternForm({ ...patternForm, targetPlace: e.target.value })}
                                  className="mt-1"
                                />
                              </div>

                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleSaveDistributionPattern(pattern.id)}>
                                  保存
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingPattern(null)
                                    setPatternForm({ title: "", body: "", targetPlace: "" })
                                    setPatternErrors({})
                                  }}
                                >
                                  キャンセル
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{pattern.title}</p>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{pattern.body}</p>
                                  {pattern.targetPlace && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      掲載場所: {pattern.targetPlace}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCopyDistributionPattern(pattern)}
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  コピー
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditDistributionPattern(pattern)}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  編集
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteDistributionPattern(pattern.id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  削除
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === "list") {
          return (
      <div className="flex-1 space-y-4 p-6 bg-gray-50 h-full overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">求人管理</h2>
          <div className="flex gap-2">
            <Button onClick={handleNewJob}>
              <Plus className="mr-2 h-4 w-4" />
              新規作成
            </Button>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5" />
              検索・フィルタ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="企業名・職種・勤務地で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10"
                />
              </div>
              <Button variant="outline" onClick={resetFilters} className="shrink-0 h-10 px-4 bg-transparent">
                <X className="mr-2 h-4 w-4" />
                フィルターリセット
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              <div className="space-y-1.5 lg:col-span-1.5">
                <Label className="text-sm font-medium text-muted-foreground">勤務地</Label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="全て" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全て</SelectItem>
                    <SelectItem value="北海道">北海道</SelectItem>
                    <SelectItem value="青森県">青森県</SelectItem>
                    <SelectItem value="岩手県">岩手県</SelectItem>
                    <SelectItem value="宮城県">宮城県</SelectItem>
                    <SelectItem value="秋田県">秋田県</SelectItem>
                    <SelectItem value="山形県">山形県</SelectItem>
                    <SelectItem value="福島県">福島県</SelectItem>
                    <SelectItem value="茨城県">茨城県</SelectItem>
                    <SelectItem value="栃木県">栃木県</SelectItem>
                    <SelectItem value="群馬県">群馬県</SelectItem>
                    <SelectItem value="埼玉県">埼玉県</SelectItem>
                    <SelectItem value="千葉県">千葉県</SelectItem>
                    <SelectItem value="東京都">東京都</SelectItem>
                    <SelectItem value="神奈川県">神奈川県</SelectItem>
                    <SelectItem value="新潟県">新潟県</SelectItem>
                    <SelectItem value="富山県">富山県</SelectItem>
                    <SelectItem value="石川県">石川県</SelectItem>
                    <SelectItem value="福井県">福井県</SelectItem>
                    <SelectItem value="山梨県">山梨県</SelectItem>
                    <SelectItem value="長野県">長野県</SelectItem>
                    <SelectItem value="岐阜県">岐阜県</SelectItem>
                    <SelectItem value="静岡県">静岡県</SelectItem>
                    <SelectItem value="愛知県">愛知県</SelectItem>
                    <SelectItem value="三重県">三重県</SelectItem>
                    <SelectItem value="滋賀県">滋賀県</SelectItem>
                    <SelectItem value="京都府">京都府</SelectItem>
                    <SelectItem value="大阪府">大阪府</SelectItem>
                    <SelectItem value="兵庫県">兵庫県</SelectItem>
                    <SelectItem value="奈良県">奈良県</SelectItem>
                    <SelectItem value="和歌山県">和歌山県</SelectItem>
                    <SelectItem value="鳥取県">鳥取県</SelectItem>
                    <SelectItem value="島根県">島根県</SelectItem>
                    <SelectItem value="岡山県">岡山県</SelectItem>
                    <SelectItem value="広島県">広島県</SelectItem>
                    <SelectItem value="山口県">山口県</SelectItem>
                    <SelectItem value="徳島県">徳島県</SelectItem>
                    <SelectItem value="香川県">香川県</SelectItem>
                    <SelectItem value="愛媛県">愛媛県</SelectItem>
                    <SelectItem value="高知県">高知県</SelectItem>
                    <SelectItem value="福岡県">福岡県</SelectItem>
                    <SelectItem value="佐賀県">佐賀県</SelectItem>
                    <SelectItem value="長崎県">長崎県</SelectItem>
                    <SelectItem value="熊本県">熊本県</SelectItem>
                    <SelectItem value="大分県">大分県</SelectItem>
                    <SelectItem value="宮崎県">宮崎県</SelectItem>
                    <SelectItem value="鹿児島県">鹿児島県</SelectItem>
                    <SelectItem value="沖縄県">沖縄県</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-muted-foreground">月給下限</Label>
                <Input
                  type="number"
                  placeholder="200000"
                  value={salaryMinFilter}
                  onChange={(e) => setSalaryMinFilter(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-muted-foreground">月給上限</Label>
                <Input
                  type="number"
                  placeholder="300000"
                  value={salaryMaxFilter}
                  onChange={(e) => setSalaryMaxFilter(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5 lg:col-span-1.5">
                <Label className="text-sm font-medium text-muted-foreground">在留資格</Label>
                <Select value={visaFilter} onValueChange={setVisaFilter}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="全て" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全て</SelectItem>
                    {uniqueVisaTypes.map((visa) => (
                      <SelectItem key={visa} value={visa}>
                        {visaTypeLabels[visa as keyof typeof visaTypeLabels] || visa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 lg:col-span-1.5">
                <Label className="text-sm font-medium text-muted-foreground">JLPT</Label>
                <Select value={jlptFilter} onValueChange={setJlptFilter}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="全て" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全て</SelectItem>
                    {uniqueJlptLevels.map((jlpt) => (
                      <SelectItem key={jlpt} value={jlpt}>
                        {jlpt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-muted-foreground">優先度</Label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="全て" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全て</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span>求人一覧 ({filteredJobs.length}件)</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadCsvTemplate} data-testid="csv-job-template">
                  <FileText className="mr-2 h-4 w-4" />
                  CSVフォーマットDL
                </Button>
                <Button variant="outline" size="sm" onClick={exportJobsCsv} data-testid="csv-job-export">
                  <Download className="mr-2 h-4 w-4" />
                  一覧をCSV出力
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCsvImportDialogOpen(true)}
                  data-testid="csv-job-import"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  CSVインポート
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">求人ID</TableHead>
                    <TableHead className="min-w-32">企業名</TableHead>
                    <TableHead className="min-w-24">職種</TableHead>
                    <TableHead className="min-w-24">勤務地</TableHead>
                    <TableHead className="min-w-32">月給レンジ</TableHead>
                    <TableHead className="min-w-24">在留資格</TableHead>
                    <TableHead className="w-16">JLPT</TableHead>
                    <TableHead className="w-16">優先度</TableHead>
                    <TableHead className="w-20">ステータス</TableHead>
                    <TableHead className="w-24">最終更新</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow
                      key={job.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleViewJob(job.id)}
                    >
                      <TableCell className="font-mono text-xs">{job.id}</TableCell>
                      <TableCell className="font-medium">{job.company}</TableCell>
                      <TableCell>{job.title}</TableCell>
                      <TableCell>
                        {job.location.pref} {job.location.city}
                      </TableCell>
                      <TableCell className="text-sm">
                        ¥{job.salary.min.toLocaleString()} - ¥{job.salary.max.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {visaTypeLabels[job.visa.types[0] as keyof typeof visaTypeLabels] || job.visa.types[0]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {job.visa.jlpt}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={priorityColors[job.priority as keyof typeof priorityColors]}
                          className="text-xs"
                        >
                          {job.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[job.status as keyof typeof statusColors]} className="text-xs">
                          {statusLabels[job.status as keyof typeof statusLabels]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{job.updatedAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={csvImportDialogOpen} onOpenChange={setCsvImportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>CSVインポート</DialogTitle>
              <DialogDescription>
                求人データをCSVファイルからインポートします。既存のjob_idは上書き、新規は追加されます。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  data-testid="csv-job-import-file"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCsvImportDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleCsvImport} disabled={!csvFile} data-testid="csv-job-import-exec">
                実行
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 取引先選択モーダル */}
        <PartnerSelectorModal
          open={partnerSelectorOpen}
          onOpenChange={setPartnerSelectorOpen}
          onSelect={handlePartnerSelect}
          selectedPartnerId={selectedPartner?.id}
        />
      </div>
    )
  }
}
