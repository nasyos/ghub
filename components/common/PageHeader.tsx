"use client"

import { ReactNode } from "react"
import { BreadcrumbItem } from "@/lib/types"

interface PageHeaderProps {
  title: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: ReactNode
  description?: string
  compact?: boolean
}

export function PageHeader({ 
  title, 
  breadcrumbs, 
  actions, 
  description, 
  compact = true 
}: PageHeaderProps) {
  return (
    <div className={`border-b ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {/* パンくず（指定された場合のみ表示） */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="mb-2">
              <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
                {breadcrumbs.map((item, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && <span className="mx-2">/</span>}
                    {item.href ? (
                      <a 
                        href={item.href}
                        className="hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <span>{item.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          
          {/* タイトル */}
          <h1 className={`text-[24px] font-semibold leading-tight ${compact ? 'mb-1' : 'mb-2'}`}>
            {title}
          </h1>
          
          {/* 説明文（非表示） */}
          {description && (
            <p className="text-muted-foreground hidden">
              {description}
            </p>
          )}
        </div>
        
        {/* アクションボタン */}
        {actions && (
          <div className="ml-4 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

