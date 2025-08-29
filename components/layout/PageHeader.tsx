"use client"
import React from "react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Breadcrumb = { label: string; href?: string }
type Tab = { value: string; label: string }

type Props = {
  title: string
  breadcrumbs?: Breadcrumb[]
  actions?: React.ReactNode
  tabs?: Tab[]
  activeTab?: string
  onTabChange?: (value: string) => void
}

export function PageHeader({ title, breadcrumbs = [], actions, tabs, activeTab, onTabChange }: Props) {
  return (
    <div className="border-b bg-background">
      <div className="container max-w-7xl px-6 py-6">
        <nav className="text-sm text-muted-foreground">
          {breadcrumbs.map((b, i) => (
            <span key={i}>
              {i > 0 && " › "}
              {b.href ? (
                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                <a href={b.href}>{b.label}</a>
              ) : (
                b.label
              )}
            </span>
          ))}
        </nav>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <div>{actions}</div>
        </div>
        {tabs && tabs.length > 0 && (
          <div className="mt-4">
            <Tabs value={activeTab} onValueChange={onTabChange}>
              <TabsList>
                {tabs.map((t) => (
                  <TabsTrigger key={t.value} value={t.value}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}

export default PageHeader


