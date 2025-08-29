"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import React from "react"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Upload,
  Download,
  FileText,
  ImageIcon,
  File,
  Trash2,
  Plus,
  MessageSquare,
  User,
  Briefcase,
  Search,
  Eye,
  Edit,
  Save,
  X,
  GraduationCap,
  Building,
  Camera,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { loadLinks, upsertLink, removeLink, type CandidateJobLink } from "@/lib/candidate-links"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

async function parseResidenceCard(file: File) {
  // ダミー：固定の例を返す（将来API差替前提）
  return {
    residenceStatus: "技術・人文知識・国際業務",
    residenceExpiry: "2026-03-31",
    country: "ベトナム",
    name: "Nguyen Van A",
    birthdate: "1995-05-20",
    gender: "男性",
    residenceCardNo: "AB1234567",
    residence: "東京都新宿区西新宿1-1-1",
  }
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

interface CandidateDetailProps {
  candidateId: string | null
  onBack: () => void
}

const MOCK_CANDIDATES = [
  {
    id: 1,
    name: "Nguyen Thi A",
    nationality: "ベトナム",
    gender: "女性",
    age: 28,
    desiredJob: "エンジニア",
    desiredLocation: "東京都",
    status: "面談予定",
    residenceStatus: "技術・人文知識・国際業務",
    residenceExpiry: "2024-12-31",
    lastContact: "2024-01-15 14:30",
    avatar: "/placeholder.svg?height=100&width=100",
    residence: "東京都渋谷区",
    applicationRoute: "Facebook広告A",
    facebookProfile: "#",
    messengerLink: "#",
    assignedCA: "田中CA",
    education: [
      {
        id: 1,
        start_date: "2018-04-01",
        end_date: "2022-03-31",
        school_name: "Asia pacific college",
        faculty: "business",
        department: "xx",
        study_details: "xx",
      },
      {
        id: 2,
        start_date: "2016-04-01",
        end_date: "2018-03-31",
        school_name: "ubuntsu high school",
        faculty: null,
        department: null,
        study_details: null,
      },
    ],
    work_experience: [
      {
        id: 1,
        start_date: "2022-04-01",
        end_date: null,
        company_name: "株式会社テックソリューション",
        job_details:
          "Webアプリケーションの開発チームでフロントエンドエンジニアとして従事。React、TypeScriptを使用した開発、UI/UXの改善、チーム内でのコードレビューやメンタリングを担当。",
      },
      {
        id: 2,
        start_date: "2021-08-01",
        end_date: "2022-03-31",
        company_name: "フリーランス",
        job_details:
          "個人事業主として複数のクライアントのWebサイト制作に従事。WordPress、HTML/CSS、JavaScriptを使用したコーポレートサイトやECサイトの開発。",
      },
    ],
  },
  {
    id: 2,
    name: "Maria Garcia",
    nationality: "スペイン",
    gender: "女性",
    age: 32,
    desiredJob: "マーケティング",
    desiredLocation: "東京都",
    status: "面談予定",
    residenceStatus: "技術・人文知識・国際業務",
    residenceExpiry: "2024-12-31",
    lastContact: "2024-01-14 16:45",
    avatar: "/placeholder.svg?height=100&width=100",
    residence: "東京都新宿区",
    applicationRoute: "LinkedIn",
    facebookProfile: "#",
    messengerLink: "#",
    assignedCA: "佐藤CA",
    education: [],
    work_experience: [],
  },
]

const mockCandidates = MOCK_CANDIDATES

const mockCandidate = (candidateId: string) => ({
  id: Number.parseInt(candidateId),
  candidateNo: `C${candidateId.padStart(4, "0")}`,
  name: "サンプル求職者",
  nationality: "ベトナム",
  gender: "女性",
  age: 28,
  desiredJob: "エンジニア",
  residence: "東京都",
  desiredLocation: "東京都",
  residenceStatus: "技術・人文知識・国際業務",
  residenceExpiry: "2025-12-31",
  applicationRoute: "紹介",
  assignedCA: "佐藤",
  candidateStatus: "面談前",
  facebookLink: "https://facebook.com/sample",
  messengerLink: "#",
})

const mockEducation = [
  {
    id: 3,
    start_date: "2010-04-01",
    end_date: "2014-03-31",
    school_name: "University of Example",
    faculty: "Engineering",
    department: "Computer Science",
    study_details: "Bachelor of Science in Computer Science",
  },
]

const mockWorkExperience = [
  {
    id: 3,
    start_date: "2015-06-01",
    end_date: "2018-12-31",
    company_name: "Tech Corp",
    job_details: "Software Engineer",
  },
]

const mockFiles = [
  {
    id: 1,
    name: "Resume.pdf",
    type: "pdf",
    size: "250KB",
    uploadDate: "2024-01-20",
  },
  {
    id: 2,
    name: "CoverLetter.docx",
    type: "docx",
    size: "300KB",
    uploadDate: "2024-01-22",
  },
]

const statusOptions = ["面談前", "面談予定", "一次面接", "二次面接", "内定", "辞退"]

const mockInterviewRecords = [
  {
    id: 1,
    type: "一次面接",
    date: "2024-02-01",
    interviewer: "山田",
    summary: "基本的なスキルと経験を確認しました。",
    nextAction: "二次面接に進む",
  },
  {
    id: 2,
    type: "二次面接",
    date: "2024-02-08",
    interviewer: "田中",
    summary: "より詳細な技術スキルとチームへの適応性を評価しました。",
    nextAction: "内定を検討",
  },
]

const mockJobs = [
  {
    id: 1,
    title: "Webデザイナー",
    company: "クリエイティブ株式会社",
    location: "東京都渋谷区",
    salary: "年収350-450万円",
    status: "引当済み",
    comment: "UI/UXデザイン経験者",
    selectionSteps: [
      { step: "書類選考", status: "通過", date: "2024-02-10", comment: "経験豊富" },
      { step: "一次面接", status: "予定", date: "2024-02-15", comment: "" },
    ],
  },
  {
    id: 2,
    title: "フロントエンドエンジニア",
    company: "テック株式会社",
    location: "東京都新宿区",
    salary: "年収400-600万円",
    status: "募集中",
    comment: "React経験必須",
    selectionSteps: [
      { step: "書類選考", status: "未実施", date: "", comment: "" },
      { step: "一次面接", status: "未実施", date: "", comment: "" },
    ],
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "面談前":
      return "bg-gray-100 text-gray-800"
    case "面談予定":
      return "bg-blue-100 text-blue-800"
    case "一次面接":
      return "bg-green-100 text-green-800"
    case "二次面接":
      return "bg-green-100 text-green-800"
    case "内定":
      return "bg-purple-100 text-purple-800"
    case "辞退":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return <File className="h-5 w-5 text-red-500" />
    case "docx":
      return <FileText className="h-5 w-5 text-blue-500" />
    case "jpg":
    case "jpeg":
    case "png":
      return <ImageIcon className="h-5 w-5 text-green-500" />
    default:
      return <File className="h-5 w-5 text-gray-500" />
  }
}

export function CandidateDetail({ candidateId, onBack }: CandidateDetailProps) {
  const { roleNormalized } = useAuth()
  const isReadOnly = roleNormalized === "ra" || roleNormalized === "ra_manager"
  const { toast } = useToast()

  const candidate = mockCandidates.find((c) => c.id.toString() === candidateId?.toString())

  const [currentStatus, setCurrentStatus] = useState("")
  const [memo, setMemo] = useState("")
  const [isJobSearchOpen, setIsJobSearchOpen] = useState(false)
  const [jobSearchTerm, setJobSearchTerm] = useState("")

  const [isOcrOpen, setIsOcrOpen] = useState(false)
  const [ocrFile, setOcrFile] = useState<File | null>(null)
  const [ocrPreview, setOcrPreview] = useState<any>(null)
  const [ocrData, setOcrData] = useState<any>({})

  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false)
  const [basicInfo, setBasicInfo] = useState({
    name: candidate?.name || "",
    nationality: candidate?.nationality || "",
    gender: candidate?.gender || "",
    age: candidate?.age || 0,
    desiredJob: candidate?.desiredJob || "",
    residence: candidate?.residence || "",
    desiredLocation: candidate?.desiredLocation || "",
    residenceStatus: candidate?.residenceStatus || "",
    residenceExpiry: candidate?.residenceExpiry || "",
    applicationRoute: candidate?.applicationRoute || "",
    assignedCA: candidate?.assignedCA || "",
    facebookLink: candidate?.facebookProfile || "",
    birthdate: "",
    residenceCardNo: "",
  })

  const caList = [
    { id: 1, name: "田中 太郎" },
    { id: 2, name: "佐藤 花子" },
    { id: 3, name: "鈴木 一郎" },
    { id: 4, name: "高橋 美咲" },
  ]

  const [education, setEducation] = useState<Education[]>([])
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([])
  const [editingEducation, setEditingEducation] = useState<number | null>(null)
  const [editingWorkExperience, setEditingWorkExperience] = useState<number | null>(null)
  const [newEducation, setNewEducation] = useState<Partial<Education> | null>(null)
  const [newWorkExperience, setNewWorkExperience] = useState<Partial<WorkExperience> | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [editingJobId, setEditingJobId] = useState<number | null>(null)
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null)
  const [jobComments, setJobComments] = useState<{ [key: number]: string }>({})

  const [jobSelectionSteps, setJobSelectionSteps] = useState<{
    [key: number]: Array<{ step: string; status: string; date: string; comment: string }>
  }>({})
  const [newStepName, setNewStepName] = useState("")
  const [addingStepJobId, setAddingStepJobId] = useState<number | null>(null)

  const [links, setLinks] = useState<CandidateJobLink[]>(() => loadLinks(candidateId))
  useEffect(() => {
    setLinks(loadLinks(candidateId))
  }, [candidateId])

  // 追記: ジョブ一覧取得（モック/フォールバック）
  type JobLite = { jobId: string; title: string; companyName: string; location?: string }
  function loadJobsLite(): JobLite[] {
    // 既存の jobs モックが localStorage にあれば読む
    try {
      const raw = localStorage.getItem("jobs_data")
      if (raw) {
        const arr = JSON.parse(raw)
        return arr.map((j: any) => ({
          jobId: String(j.id ?? j.job_id),
          title: j.title,
          companyName: j.company_name ?? j.companyName ?? "",
          location: j.prefecture ?? j.location ?? "",
        }))
      }
    } catch {}
    // フォールバック（最低限）
    return [
      { jobId: "JOB001", title: "ITエンジニア", companyName: "株式会社ABC介護", location: "東京都" },
      { jobId: "JOB002", title: "建設作業員", companyName: "DEF建設株式会社", location: "大阪府" },
      { jobId: "JOB003", title: "製造オペレーター", companyName: "GHI製造株式会社", location: "愛知県" },
      { jobId: "JOB004", title: "農業作業員", companyName: "JKL農業協同組合", location: "北海道" },
    ]
  }

  // 追記: 追加モーダル用
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [query, setQuery] = useState("")
  const jobsLite = useMemo(() => loadJobsLite(), [])
  const filtered = useMemo(
    () => jobsLite.filter((j) => j.jobId.includes(query) || j.title.includes(query) || j.companyName.includes(query)),
    [jobsLite, query],
  )

  function handleAdd(job: JobLite) {
    if (links.some((l) => l.jobId === job.jobId)) {
      toast({ title: "すでに紐付け済みです", variant: "destructive" })
      return
    }
    const now = new Date().toISOString()
    const link: CandidateJobLink = {
      jobId: job.jobId,
      jobTitle: job.title,
      companyName: job.companyName,
      location: job.location,
      status: "CA面談",
      interviewCount: 0,
      note: "",
      updatedAt: now,
    }
    upsertLink(candidateId, link)
    setLinks(loadLinks(candidateId))
    setIsAddOpen(false)
    toast({ title: "紐付けしました" })
  }

  function patchLink(jobId: string, patch: Partial<CandidateJobLink>) {
    const cur = links.find((l) => l.jobId === jobId)
    if (!cur) return
    const next = { ...cur, ...patch, updatedAt: new Date().toISOString() }
    upsertLink(candidateId, next)
    setLinks(loadLinks(candidateId))
  }

  function handleRemove(jobId: string) {
    removeLink(candidateId, jobId)
    setLinks(loadLinks(candidateId))
    toast({ title: "削除しました" })
  }

  React.useEffect(() => {
    if (candidate) {
      setCurrentStatus(candidate.status)
      setEducation(candidate.education || mockEducation)
      setWorkExperience(candidate.work_experience || mockWorkExperience)
      setBasicInfo({
        name: candidate.name,
        nationality: candidate.nationality,
        gender: candidate.gender,
        age: candidate.age,
        desiredJob: candidate.desiredJob,
        residence: candidate.residence,
        desiredLocation: candidate.desiredLocation,
        residenceStatus: candidate.residenceStatus,
        residenceExpiry: candidate.residenceExpiry,
        applicationRoute: candidate.applicationRoute,
        assignedCA: candidate.assignedCA,
        facebookLink: candidate.facebookProfile,
        birthdate: "",
        residenceCardNo: "",
      })
    }
  }, [candidate])

  if (!candidate) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">候補者が見つかりません</p>
        </div>
      </div>
    )
  }

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
    setNewEducation({
      start_date: "",
      end_date: null,
      school_name: "",
      faculty: "",
      department: "",
      study_details: "",
    })
    setErrors({})
  }

  const handleSaveEducation = (edu: Partial<Education>, isNew = false) => {
    const validationErrors = validateEducation(edu)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    if (isNew) {
      const newEdu: Education = {
        id: Date.now(),
        start_date: edu.start_date!,
        end_date: edu.end_date || null,
        school_name: edu.school_name!,
        faculty: edu.faculty || null,
        department: edu.department || null,
        study_details: edu.study_details || null,
      }
      setEducation([...education, newEdu])
      setNewEducation(null)
    } else {
      setEducation(education.map((e) => (e.id === edu.id ? { ...e, ...edu } : e)))
      setEditingEducation(null)
    }
    setErrors({})
  }

  const handleDeleteEducation = (id: number) => {
    setEducation(education.filter((e) => e.id !== id))
  }

  const handleAddWorkExperience = () => {
    setNewWorkExperience({
      start_date: "",
      end_date: null,
      company_name: "",
      job_details: "",
    })
    setErrors({})
  }

  const handleSaveWorkExperience = (work: Partial<WorkExperience>, isNew = false) => {
    const validationErrors = validateWorkExperience(work)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    if (isNew) {
      const newWork: WorkExperience = {
        id: Date.now(),
        start_date: work.start_date!,
        end_date: work.end_date || null,
        company_name: work.company_name!,
        job_details: work.job_details!,
      }
      setWorkExperience([...workExperience, newWork])
      setNewWorkExperience(null)
    } else {
      setWorkExperience(workExperience.map((w) => (w.id === work.id ? { ...w, ...work } : w)))
      setEditingWorkExperience(null)
    }
    setErrors({})
  }

  const handleDeleteWorkExperience = (id: number) => {
    setWorkExperience(workExperience.filter((w) => w.id !== id))
  }

  const EducationCard = ({
    edu,
    isEditing,
    onSave,
    onCancel,
    onEdit,
    onDelete,
  }: {
    edu: Education | Partial<Education>
    isEditing: boolean
    onSave: (edu: Partial<Education>) => void
    onCancel: () => void
    onEdit: () => void
    onDelete: () => void
  }) => {
    const [editData, setEditData] = useState(edu)

    if (isEditing) {
      return (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">入学日 *</Label>
                <Input
                  type="date"
                  value={editData.start_date || ""}
                  onChange={(e) => setEditData({ ...editData, start_date: e.target.value })}
                  className="mt-1"
                />
                {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
              </div>
              <div>
                <Label className="text-sm font-medium">卒業日</Label>
                <Input
                  type="date"
                  value={editData.end_date || ""}
                  onChange={(e) => setEditData({ ...editData, end_date: e.target.value || null })}
                  className="mt-1"
                />
                {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">学校名 *</Label>
              <Input
                value={editData.school_name || ""}
                onChange={(e) => setEditData({ ...editData, school_name: e.target.value })}
                className="mt-1"
                placeholder="学校名を入力"
              />
              {errors.school_name && <p className="text-red-500 text-xs mt-1">{errors.school_name}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">学部</Label>
                <Input
                  value={editData.faculty || ""}
                  onChange={(e) => setEditData({ ...editData, faculty: e.target.value })}
                  className="mt-1"
                  placeholder="学部を入力"
                />
                {errors.faculty && <p className="text-red-500 text-xs mt-1">{errors.faculty}</p>}
              </div>
              <div>
                <Label className="text-sm font-medium">学科</Label>
                <Input
                  value={editData.department || ""}
                  onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                  className="mt-1"
                  placeholder="学科を入力"
                />
                {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">学習内容</Label>
              <Textarea
                value={editData.study_details || ""}
                onChange={(e) => setEditData({ ...editData, study_details: e.target.value })}
                className="mt-1"
                placeholder="専攻・研究内容・主要科目など"
                rows={3}
              />
              {errors.study_details && <p className="text-red-500 text-xs mt-1">{errors.study_details}</p>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onSave(editData)}>
                <Save className="h-4 w-4 mr-2" />
                保存
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                キャンセル
              </Button>
            </div>
          </div>
        </Card>
      )
    }

    return (
      <Card className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-medium text-lg">{edu.school_name}</h4>
            <div className="text-sm text-gray-600 mt-1">
              {edu.start_date} 〜 {edu.end_date || "在学中"}
            </div>
            {(edu.faculty || edu.department) && (
              <div className="text-sm text-gray-600">
                {edu.faculty}
                {edu.faculty && edu.department && " / "}
                {edu.department}
              </div>
            )}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {edu.study_details && <p className="text-sm text-gray-700 mt-2">{edu.study_details}</p>}
      </Card>
    )
  }

  const WorkExperienceCard = ({
    work,
    isEditing,
    onSave,
    onCancel,
    onEdit,
    onDelete,
  }: {
    work: WorkExperience | Partial<WorkExperience>
    isEditing: boolean
    onSave: (work: Partial<WorkExperience>) => void
    onCancel: () => void
    onEdit: () => void
    onDelete: () => void
  }) => {
    const [editData, setEditData] = useState(work)

    if (isEditing) {
      return (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">入社日 *</Label>
                <Input
                  type="date"
                  value={editData.start_date || ""}
                  onChange={(e) => setEditData({ ...editData, start_date: e.target.value })}
                  className="mt-1"
                />
                {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
              </div>
              <div>
                <Label className="text-sm font-medium">退職日</Label>
                <Input
                  type="date"
                  value={editData.end_date || ""}
                  onChange={(e) => setEditData({ ...editData, end_date: e.target.value || null })}
                  className="mt-1"
                />
                {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">会社名 *</Label>
              <Input
                value={editData.company_name || ""}
                onChange={(e) => setEditData({ ...editData, company_name: e.target.value })}
                className="mt-1"
                placeholder="会社名を入力"
              />
              {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>}
            </div>
            <div>
              <Label className="text-sm font-medium">業務内容 *</Label>
              <Textarea
                value={editData.job_details || ""}
                onChange={(e) => setEditData({ ...editData, job_details: e.target.value })}
                className="mt-1"
                placeholder="担当業務・成果など"
                rows={4}
              />
              {errors.job_details && <p className="text-red-500 text-xs mt-1">{errors.job_details}</p>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onSave(editData)}>
                <Save className="h-4 w-4 mr-2" />
                保存
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                キャンセル
              </Button>
            </div>
          </div>
        </Card>
      )
    }

    return (
      <Card className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-medium text-lg">{work.company_name}</h4>
            <div className="text-sm text-gray-600 mt-1">
              {work.start_date} 〜 {work.end_date || "在職中"}
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-700 mt-2">{work.job_details}</p>
      </Card>
    )
  }

  const handleOcrFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setOcrFile(file)

    try {
      const parsedData = await parseResidenceCard(file)
      setOcrData(parsedData)
      setOcrPreview(parsedData)
    } catch (error) {
      console.error("OCR parsing failed:", error)
      toast({
        title: "エラー",
        description: "在留カードの読み取りに失敗しました。",
        variant: "destructive",
      })
    }
  }

  const handleApplyOcrData = () => {
    if (!ocrPreview) return

    setBasicInfo({
      ...basicInfo,
      residenceStatus: ocrData.residenceStatus || basicInfo.residenceStatus,
      residenceExpiry: ocrData.residenceExpiry || basicInfo.residenceExpiry,
      nationality: ocrData.country || basicInfo.nationality,
      name: ocrData.name || basicInfo.name,
      birthdate: ocrData.birthdate || basicInfo.birthdate,
      gender: ocrData.gender || basicInfo.gender,
      residenceCardNo: ocrData.residenceCardNo || basicInfo.residenceCardNo,
      residence: ocrData.residence || basicInfo.residence,
    })

    toast({
      title: "成功",
      description: "OCR結果を反映しました",
    })

    setIsOcrOpen(false)
    setOcrFile(null)
    setOcrPreview(null)
    setOcrData({})
  }

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus)
    // ここで実際のステータス更新処理を行う
    console.log(`ステータスを${newStatus}に変更`)
  }

  const handleMemoSave = () => {
    // メモ保存処理
    console.log("メモを保存:", memo)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // ファイルアップロード処理
      console.log("ファイルをアップロード:", files)
    }
  }

  const handleSaveBasicInfo = () => {
    // ここで実際の保存処理を行う
    console.log("基本情報を保存:", basicInfo)
    setIsEditingBasicInfo(false)
  }

  const handleStepStatusChange = (jobId: number, stepIndex: number, status: string) => {
    console.log(`[v0] Updating step status for job ${jobId}, step ${stepIndex}: ${status}`)
    // Here you would update the job's selection steps
  }

  const handleStepCommentSave = (jobId: number, stepIndex: number, comment: string) => {
    console.log(`[v0] Saving step comment for job ${jobId}, step ${stepIndex}: ${comment}`)
    setEditingJobId(null)
    setEditingStepIndex(null)
  }

  const handleJobCommentSave = (jobId: number, comment: string) => {
    console.log(`[v0] Saving job comment for job ${jobId}: ${comment}`)
    setJobComments({ ...jobComments, [jobId]: comment })
  }

  const handleAddSelectionStep = (jobId: number) => {
    if (!newStepName.trim()) return

    const currentSteps = jobSelectionSteps[jobId] || mockJobs.find((j) => j.id === jobId)?.selectionSteps || []
    const newStep = {
      step: newStepName.trim(),
      status: "未実施",
      date: "",
      comment: "",
    }

    setJobSelectionSteps({
      ...jobSelectionSteps,
      [jobId]: [...currentSteps, newStep],
    })

    setNewStepName("")
    setAddingStepJobId(null)
    console.log(`[v0] Added new selection step: ${newStepName} for job ${jobId}`)
  }

  const handleDeleteSelectionStep = (jobId: number, stepIndex: number) => {
    const currentSteps = jobSelectionSteps[jobId] || mockJobs.find((j) => j.id === jobId)?.selectionSteps || []
    const updatedSteps = currentSteps.filter((_, index) => index !== stepIndex)

    setJobSelectionSteps({
      ...jobSelectionSteps,
      [jobId]: updatedSteps,
    })

    console.log(`[v0] Deleted selection step at index ${stepIndex} for job ${jobId}`)
  }

  const getJobSelectionSteps = (jobId: number) => {
    return jobSelectionSteps[jobId] || mockJobs.find((j) => j.id === jobId)?.selectionSteps || []
  }

      return (
      <div className="flex-1 space-y-4 p-6 bg-gray-50 h-full overflow-y-auto">
        <div className="flex items-center space-x-1 text-xs text-gray-500 mb-2">
          <span>ホーム</span>
          <span>&gt;</span>
          <span>候補者詳細</span>
        </div>
        {/* ヘッダー */}
        <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">候補者詳細</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  基本情報
                </CardTitle>
                <div className="flex gap-2">
                  <Dialog open={isOcrOpen} onOpenChange={setIsOcrOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" data-testid="ocr-open">
                        <Camera className="h-4 w-4 mr-2" />
                        在留カードOCR取込
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>在留カードOCR取込</DialogTitle>
                        <DialogDescription>
                          在留カードの画像をアップロードして、情報を自動で取り込みます。
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="ocr-file">画像ファイル選択</Label>
                          <Input
                            id="ocr-file"
                            type="file"
                            accept="image/*"
                            onChange={handleOcrFileChange}
                            data-testid="ocr-file"
                            className="mt-1"
                          />
                        </div>

                        {ocrPreview && (
                          <div className="space-y-4">
                            <h4 className="font-semibold">プレビュー</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>項目</TableHead>
                                  <TableHead>OCR値</TableHead>
                                  <TableHead>反映先フォーム値</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <TableRow>
                                  <TableCell>在留資格</TableCell>
                                  <TableCell>{ocrData.residenceStatus}</TableCell>
                                  <TableCell>
                                    <Input
                                      value={ocrData.residenceStatus || ""}
                                      onChange={(e) => setOcrData({ ...ocrData, residenceStatus: e.target.value })}
                                    />
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>在留期限</TableCell>
                                  <TableCell>{ocrData.residenceExpiry}</TableCell>
                                  <TableCell>
                                    <Input
                                      type="date"
                                      value={ocrData.residenceExpiry || ""}
                                      onChange={(e) => setOcrData({ ...ocrData, residenceExpiry: e.target.value })}
                                    />
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>国籍</TableCell>
                                  <TableCell>{ocrData.country}</TableCell>
                                  <TableCell>
                                    <Input
                                      value={ocrData.country || ""}
                                      onChange={(e) => setOcrData({ ...ocrData, country: e.target.value })}
                                    />
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>氏名（漢字）</TableCell>
                                  <TableCell>{ocrData.name}</TableCell>
                                  <TableCell>
                                    <Input
                                      value={ocrData.name || ""}
                                      onChange={(e) => setOcrData({ ...ocrData, name: e.target.value })}
                                    />
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>生年月日</TableCell>
                                  <TableCell>{ocrData.birthdate}</TableCell>
                                  <TableCell>
                                    <Input
                                      type="date"
                                      value={ocrData.birthdate || ""}
                                      onChange={(e) => setOcrData({ ...ocrData, birthdate: e.target.value })}
                                    />
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>性別</TableCell>
                                  <TableCell>{ocrData.gender}</TableCell>
                                  <TableCell>
                                    <Select
                                      value={ocrData.gender || ""}
                                      onValueChange={(value) => setOcrData({ ...ocrData, gender: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="男性">男性</SelectItem>
                                        <SelectItem value="女性">女性</SelectItem>
                                        <SelectItem value="その他">その他</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>在留カード番号</TableCell>
                                  <TableCell>{ocrData.residenceCardNo}</TableCell>
                                  <TableCell>
                                    <Input
                                      value={ocrData.residenceCardNo || ""}
                                      onChange={(e) => setOcrData({ ...ocrData, residenceCardNo: e.target.value })}
                                    />
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>住所</TableCell>
                                  <TableCell>{ocrData.residence}</TableCell>
                                  <TableCell>
                                    <Input
                                      value={ocrData.residence || ""}
                                      onChange={(e) => setOcrData({ ...ocrData, residence: e.target.value })}
                                    />
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOcrOpen(false)}>
                          キャンセル
                        </Button>
                        <Button onClick={handleApplyOcrData} disabled={!ocrPreview} data-testid="ocr-apply">
                          反映
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="sm" onClick={() => setIsEditingBasicInfo(!isEditingBasicInfo)}>
                    {isEditingBasicInfo ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        キャンセル
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        編集
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={candidate.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg">{candidate.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  {isEditingBasicInfo ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">名前</Label>
                          <Input
                            value={basicInfo.name}
                            onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">国籍</Label>
                          <Input
                            value={basicInfo.nationality}
                            onChange={(e) => setBasicInfo({ ...basicInfo, nationality: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">性別</Label>
                          <Select
                            value={basicInfo.gender}
                            onValueChange={(value) => setBasicInfo({ ...basicInfo, gender: value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="男性">男性</SelectItem>
                              <SelectItem value="女性">女性</SelectItem>
                              <SelectItem value="その他">その他</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">年齢</Label>
                          <Input
                            type="number"
                            value={basicInfo.age}
                            onChange={(e) => setBasicInfo({ ...basicInfo, age: Number.parseInt(e.target.value) })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">希望職種</Label>
                          <Input
                            value={basicInfo.desiredJob}
                            onChange={(e) => setBasicInfo({ ...basicInfo, desiredJob: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">居住地</Label>
                          <Input
                            value={basicInfo.residence}
                            onChange={(e) => setBasicInfo({ ...basicInfo, residence: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">希望勤務地</Label>
                          <Input
                            value={basicInfo.desiredLocation}
                            onChange={(e) => setBasicInfo({ ...basicInfo, desiredLocation: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">在留資格</Label>
                          <Input
                            value={basicInfo.residenceStatus}
                            onChange={(e) => setBasicInfo({ ...basicInfo, residenceStatus: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">在留期限</Label>
                          <Input
                            type="date"
                            value={basicInfo.residenceExpiry}
                            onChange={(e) => setBasicInfo({ ...basicInfo, residenceExpiry: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">応募経路</Label>
                          <Input
                            value={basicInfo.applicationRoute}
                            onChange={(e) => setBasicInfo({ ...basicInfo, applicationRoute: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">担当CA</Label>
                          <Select
                            value={basicInfo.assignedCA}
                            onChange={(e) => setBasicInfo({ ...basicInfo, assignedCA: e.target.value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {caList.map((ca) => (
                                <SelectItem key={ca.id} value={ca.name}>
                                  {ca.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-600">Facebookリンク</Label>
                          <div className="flex gap-2">
                            <Input
                              value={basicInfo.facebookLink}
                              onChange={(e) => setBasicInfo({ ...basicInfo, facebookLink: e.target.value })}
                              className="mt-1 flex-1"
                              placeholder="https://facebook.com/username"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (basicInfo.facebookLink) {
                                  window.open(basicInfo.facebookLink, "_blank", "noopener,noreferrer")
                                }
                              }}
                              disabled={!basicInfo.facebookLink}
                              className="mt-1"
                            >
                              遷移
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSaveBasicInfo}>
                          <Save className="h-4 w-4 mr-2" />
                          保存
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditingBasicInfo(false)}>
                          キャンセル
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">名前</Label>
                        <p>{basicInfo.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">国籍</Label>
                        <p>{basicInfo.nationality}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">性別</Label>
                        <p>{basicInfo.gender}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">年齢</Label>
                        <p>{basicInfo.age}歳</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">ステータス</Label>
                        <Badge className={getStatusColor(candidate.status)}>{candidate.status}</Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">希望職種</Label>
                        <p>{basicInfo.desiredJob}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">居住地</Label>
                        <p>{basicInfo.residence}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">希望勤務地</Label>
                        <p>{basicInfo.desiredLocation}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">在留資格</Label>
                        <p>{basicInfo.residenceStatus}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">在留期限</Label>
                        <p className="text-orange-600">{basicInfo.residenceExpiry}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">担当CA</Label>
                        <p>{basicInfo.assignedCA}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-600">Facebookリンク</Label>
                        <div className="flex gap-2">
                          <Input
                            value={basicInfo.facebookLink}
                            readOnly
                            className="flex-1 bg-gray-50"
                            placeholder="未設定"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (basicInfo.facebookLink) {
                                window.open(basicInfo.facebookLink, "_blank", "noopener,noreferrer")
                              }
                            }}
                            disabled={!basicInfo.facebookLink}
                          >
                            遷移
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">最終連絡日時</Label>
                        <p>{candidate.lastContact}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={candidate.messengerLink} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    メッセンジャー
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 学歴 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  学歴
                </CardTitle>
                <Button size="sm" onClick={handleAddEducation}>
                  <Plus className="h-4 w-4 mr-2" />
                  追加
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {education.map((edu) => (
                  <EducationCard
                    key={edu.id}
                    edu={edu}
                    isEditing={editingEducation === edu.id}
                    onSave={(updatedEdu) => handleSaveEducation({ ...updatedEdu, id: edu.id })}
                    onCancel={() => setEditingEducation(null)}
                    onEdit={() => setEditingEducation(edu.id)}
                    onDelete={() => handleDeleteEducation(edu.id)}
                  />
                ))}
                {newEducation && (
                  <EducationCard
                    edu={newEducation}
                    isEditing={true}
                    onSave={(edu) => handleSaveEducation(edu, true)}
                    onCancel={() => setNewEducation(null)}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                )}
                {education.length === 0 && !newEducation && (
                  <div className="text-center py-8 text-gray-500">学歴が登録されていません</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 職歴 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  職歴
                </CardTitle>
                <Button size="sm" onClick={handleAddWorkExperience}>
                  <Plus className="h-4 w-4 mr-2" />
                  追加
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workExperience.map((work) => (
                  <WorkExperienceCard
                    key={work.id}
                    work={work}
                    isEditing={editingWorkExperience === work.id}
                    onSave={(updatedWork) => handleSaveWorkExperience({ ...updatedWork, id: work.id })}
                    onCancel={() => setEditingWorkExperience(null)}
                    onEdit={() => setEditingWorkExperience(work.id)}
                    onDelete={() => handleDeleteWorkExperience(work.id)}
                  />
                ))}
                {newWorkExperience && (
                  <WorkExperienceCard
                    work={newWorkExperience}
                    isEditing={true}
                    onSave={(work) => handleSaveWorkExperience(work, true)}
                    onCancel={() => setNewWorkExperience(null)}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                )}
                {workExperience.length === 0 && !newWorkExperience && (
                  <div className="text-center py-8 text-gray-500">職歴が登録されていません</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 添付ファイル */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  添付ファイル
                </CardTitle>
                <div>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <Button size="sm" asChild>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      ファイルアップロード
                    </label>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    {getFileIcon(file.type)}
                    <div className="flex-1">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {file.size} • {file.uploadDate}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <section className="mt-6" data-testid="cj-panel">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">紐付け求人</CardTitle>
                  <Button data-testid="cj-add" onClick={() => setIsAddOpen(true)} disabled={isReadOnly}>
                    求人を追加
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table data-testid="cj-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>求人ID</TableHead>
                      <TableHead>企業名</TableHead>
                      <TableHead>職種</TableHead>
                      <TableHead>勤務地</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>面接回数</TableHead>
                      <TableHead>メモ</TableHead>
                      <TableHead>最終更新</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {links.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-muted-foreground">
                          紐付けはありません
                        </TableCell>
                      </TableRow>
                    ) : (
                      links.map((l) => (
                        <TableRow key={l.jobId} data-testid={`cj-row-${l.jobId}`}>
                          <TableCell>{l.jobId}</TableCell>
                          <TableCell>{l.companyName}</TableCell>
                          <TableCell>{l.jobTitle}</TableCell>
                          <TableCell>{l.location ?? ""}</TableCell>
                          <TableCell>
                            <Select
                              value={l.status}
                              onValueChange={(v) => patchLink(l.jobId, { status: v as any })}
                              disabled={isReadOnly}
                              data-testid={`cj-status-${l.jobId}`}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CA面談">CA面談</SelectItem>
                                <SelectItem value="書類選考">書類選考</SelectItem>
                                <SelectItem value="面接選考">面接選考</SelectItem>
                                <SelectItem value="内定">内定</SelectItem>
                                <SelectItem value="決定">決定</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              value={l.interviewCount}
                              onChange={(e) => patchLink(l.jobId, { interviewCount: Number(e.target.value || 0) })}
                              disabled={isReadOnly}
                              className="w-20"
                              data-testid={`cj-interviews-${l.jobId}`}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={l.note ?? ""}
                              onChange={(e) => patchLink(l.jobId, { note: e.target.value })}
                              disabled={isReadOnly}
                              data-testid={`cj-note-${l.jobId}`}
                            />
                          </TableCell>
                          <TableCell>{new Date(l.updatedAt).toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemove(l.jobId)}
                              disabled={isReadOnly}
                              data-testid={`cj-del-${l.jobId}`}
                            >
                              削除
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* 右側 - 選考管理 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                選考管理
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ステータス選択 */}
              <div>
                <Label className="text-sm font-medium">選考ステップ</Label>
                <Select value={currentStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 面談記録 */}
              <div>
                <Label className="text-sm font-medium">面談記録</Label>
                <div className="mt-2 space-y-3">
                  {mockInterviewRecords.map((record) => (
                    <div key={record.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{record.type}</Badge>
                        <span className="text-sm text-gray-500">{record.date}</span>
                      </div>
                      <p className="text-sm mb-2">
                        <strong>面談者:</strong> {record.interviewer}
                      </p>
                      <p className="text-sm mb-2">{record.summary}</p>
                      <p className="text-sm text-blue-600">
                        <strong>次のアクション:</strong> {record.nextAction}
                      </p>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    面談記録を追加
                  </Button>
                </div>
              </div>

              {/* メモ */}
              <div>
                <Label className="text-sm font-medium">メモ</Label>
                <Textarea
                  placeholder="候補者に関するメモを入力..."
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="mt-1 min-h-[100px]"
                />
                <Button size="sm" className="mt-2" onClick={handleMemoSave}>
                  保存
                </Button>
              </div>

              {/* 求人引当 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">求人引当</Label>
                  <Dialog open={isJobSearchOpen} onOpenChange={setIsJobSearchOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        求人を追加
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>求人検索</DialogTitle>
                        <DialogDescription>候補者に引当てる求人を検索してください</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="求人名、企業名で検索..."
                            value={jobSearchTerm}
                            onChange={(e) => setJobSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {/* 求人検索結果のモック */}
                          <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <h4 className="font-medium">Webデザイナー</h4>
                            <p className="text-sm text-gray-600">クリエイティブ株式会社 • 東京都渋谷区</p>
                            <p className="text-sm text-gray-600">年収350-450万円</p>
                          </div>
                          <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <h4 className="font-medium">フロントエンドエンジニア</h4>
                            <p className="text-sm text-gray-600">テック株式会社 • 東京都新宿区</p>
                            <p className="text-sm text-gray-600">年収400-600万円</p>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsJobSearchOpen(false)}>
                          キャンセル
                        </Button>
                        <Button onClick={() => setIsJobSearchOpen(false)}>選択</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-3">
                  {mockJobs.map((job) => (
                    <div key={job.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium cursor-pointer hover:text-blue-600">{job.title}</h4>
                          <p className="text-sm text-gray-600">{job.company}</p>
                          <p className="text-sm text-gray-600">
                            {job.location} • {job.salary}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium text-gray-700">選考ステップ</Label>
                          <Button variant="outline" size="sm" onClick={() => setAddingStepJobId(job.id)}>
                            <Plus className="h-4 w-4 mr-1" />
                            ステップ追加
                          </Button>
                        </div>

                        {addingStepJobId === job.id && (
                          <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex gap-2">
                              <Input
                                placeholder="新しいステップ名を入力..."
                                value={newStepName}
                                onChange={(e) => setNewStepName(e.target.value)}
                                className="flex-1"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleAddSelectionStep(job.id)
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                onClick={() => handleAddSelectionStep(job.id)}
                                disabled={!newStepName.trim()}
                              >
                                追加
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setAddingStepJobId(null)
                                  setNewStepName("")
                                }}
                              >
                                キャンセル
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          {getJobSelectionSteps(job.id).map((step, stepIndex) => (
                            <div key={stepIndex} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                              <div className="flex-1">
                                <span className="text-sm font-medium">{step.step}</span>
                                {step.date && <span className="text-xs text-gray-500 ml-2">({step.date})</span>}
                              </div>
                              <Select
                                value={step.status}
                                onValueChange={(value) => handleStepStatusChange(job.id, stepIndex, value)}
                              >
                                <SelectTrigger className="w-24 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="未実施">未実施</SelectItem>
                                  <SelectItem value="予定">予定</SelectItem>
                                  <SelectItem value="審査中">審査中</SelectItem>
                                  <SelectItem value="通過">通過</SelectItem>
                                  <SelectItem value="不合格">不合格</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingJobId(job.id)
                                  setEditingStepIndex(stepIndex)
                                }}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSelectionStep(job.id, stepIndex)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">求人コメント</Label>
                        <Textarea
                          placeholder="この求人に関するコメント..."
                          value={jobComments[job.id] || job.comment}
                          onChange={(e) => setJobComments({ ...jobComments, [job.id]: e.target.value })}
                          onBlur={() => handleJobCommentSave(job.id, jobComments[job.id] || job.comment)}
                          className="text-sm"
                          rows={2}
                        />
                      </div>

                      <Badge variant={job.status === "引当済み" ? "default" : "secondary"} className="mt-2">
                        {job.status}
                      </Badge>
                    </div>
                  ))}
                </div>

                <Dialog
                  open={editingJobId !== null && editingStepIndex !== null}
                  onOpenChange={() => {
                    setEditingJobId(null)
                    setEditingStepIndex(null)
                  }}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>選考ステップコメント</DialogTitle>
                      <DialogDescription>
                        {editingJobId &&
                          editingStepIndex !== null &&
                          mockJobs.find((j) => j.id === editingJobId)?.selectionSteps[editingStepIndex]?.step}{" "}
                        のコメントを編集
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="選考ステップに関するコメント..."
                        defaultValue={
                          editingJobId && editingStepIndex !== null
                            ? mockJobs.find((j) => j.id === editingJobId)?.selectionSteps[editingStepIndex]?.comment
                            : ""
                        }
                        rows={3}
                        id="step-comment"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingJobId(null)
                          setEditingStepIndex(null)
                        }}
                      >
                        キャンセル
                      </Button>
                      <Button
                        onClick={() => {
                          const comment = (document.getElementById("step-comment") as HTMLTextAreaElement)?.value || ""
                          if (editingJobId && editingStepIndex !== null) {
                            handleStepCommentSave(editingJobId, editingStepIndex, comment)
                          }
                        }}
                      >
                        保存
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>求人を追加</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2">
            <Input
              placeholder="求人ID・企業名・職種を検索"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              data-testid="cj-search"
            />
          </div>
          <div className="mt-3 max-h-[40vh] overflow-auto rounded border">
            {filtered.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">該当する求人がありません</div>
            ) : (
              filtered.map((j) => (
                <div key={j.jobId} className="flex items-center justify-between border-b p-2">
                  <div className="text-sm">
                    <div className="font-medium">{j.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {j.companyName}／{j.jobId}
                      {j.location ? `／${j.location}` : ""}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleAdd(j)} disabled={isReadOnly} data-testid="cj-add-exec">
                    追加
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CandidateDetail
