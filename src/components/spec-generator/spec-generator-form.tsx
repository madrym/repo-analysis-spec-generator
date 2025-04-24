"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"

interface Question {
  id: string
  label: string
  type: "text" | "textarea" | "select"
  options?: string[]
  required?: boolean
  placeholder?: string
}

interface SpecGeneratorFormProps {
  questions: Question[]
  onSubmit: (answers: Record<string, string>) => void
  onBack: () => void
  isLoading: boolean
}

export function SpecGeneratorForm({ questions, onSubmit, onBack, isLoading }: SpecGeneratorFormProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const handleChange = (id: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(answers)
  }

  const isFormValid = () => {
    return questions.filter((q) => q.required).every((q) => answers[q.id] && answers[q.id].trim() !== "")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Specification Questions</CardTitle>
        <CardDescription>
          Please answer the following questions to help us generate detailed specifications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((question) => (
            <div key={question.id} className="space-y-2">
              <label htmlFor={question.id} className="text-sm font-medium flex items-center">
                {question.label}
                {question.required && <span className="text-destructive ml-1">*</span>}
              </label>

              {question.type === "textarea" ? (
                <Textarea
                  id={question.id}
                  value={answers[question.id] || ""}
                  onChange={(e) => handleChange(question.id, e.target.value)}
                  placeholder={question.placeholder}
                  required={question.required}
                  className="min-h-[100px]"
                />
              ) : question.type === "select" && question.options ? (
                <select
                  id={question.id}
                  value={answers[question.id] || ""}
                  onChange={(e) => handleChange(question.id, e.target.value)}
                  required={question.required}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="">Select an option</option>
                  {question.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={question.id}
                  value={answers[question.id] || ""}
                  onChange={(e) => handleChange(question.id, e.target.value)}
                  placeholder={question.placeholder}
                  required={question.required}
                />
              )}
            </div>
          ))}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" onClick={handleSubmit} disabled={isLoading || !isFormValid()}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Specifications...
            </>
          ) : (
            "Generate Specifications"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
