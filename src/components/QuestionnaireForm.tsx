"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface QuestionnaireFormProps {
  questions: string[];
  onAnswers: (answers: string[]) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function QuestionnaireForm({ questions, onAnswers, onCancel, isSubmitting = false }: QuestionnaireFormProps) {
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(''));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!answers[currentQuestion].trim()) {
      setError('Please provide an answer before proceeding.');
      return;
    }
    setError(null);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      onAnswers(answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setError(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Health Assessment Questionnaire</CardTitle>
        <CardDescription>
          Question {currentQuestion + 1} of {questions.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">
              {questions[currentQuestion]}
            </h3>
            <Textarea
              value={answers[currentQuestion]}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[100px]"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-between">
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0 || isSubmitting}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {currentQuestion === questions.length - 1 ? 'Submitting...' : 'Next'}
                </>
              ) : (
                currentQuestion === questions.length - 1 ? 'Submit' : 'Next'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
