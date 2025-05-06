"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { FaHeartbeat, FaUser, FaCalendarAlt, FaVenusMars, FaNotesMedical, FaHistory } from 'react-icons/fa';

const ManoMedAIPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    symptoms: '',
    medicalHistory: ''
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signup?redirect_url=/manomedai');
    }
  }, [loading, user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams(formData);
    router.push(`/questionnaire?${queryParams.toString()}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading || !user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-background text-foreground">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-primary mb-4 flex items-center justify-center gap-3">
          <FaHeartbeat className="text-5xl" />
          ManoMed AI
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl">
          Begin your health journey—enter your symptoms and medical history to get AI-assisted recommendations.
        </p>
      </div>

      <Card className="w-full max-w-xl shadow-lg border-primary/20">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="text-2xl text-primary">Health Assessment Form</CardTitle>
          <CardDescription className="text-lg">
            Please provide your symptoms and medical history for a personalized health assessment.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-lg flex items-center gap-2">
                  <FaUser className="text-primary" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="h-12 text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="text-lg flex items-center gap-2">
                  <FaCalendarAlt className="text-primary" />
                  Age
                </Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  placeholder="Enter your age"
                  className="h-12 text-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="text-lg flex items-center gap-2">
                <FaVenusMars className="text-primary" />
                Gender
              </Label>
              <Input
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                placeholder="Enter your gender"
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms" className="text-lg flex items-center gap-2">
                <FaNotesMedical className="text-primary" />
                Symptoms
              </Label>
              <Textarea
                id="symptoms"
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                required
                placeholder="Describe your symptoms in detail"
                className="min-h-[120px] text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicalHistory" className="text-lg flex items-center gap-2">
                <FaHistory className="text-primary" />
                Medical History
              </Label>
              <Textarea
                id="medicalHistory"
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                placeholder="Describe your medical history (optional)"
                className="min-h-[120px] text-lg"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Assessment
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManoMedAIPage; 