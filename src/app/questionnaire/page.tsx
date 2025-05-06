"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { FaHeartbeat, FaUser, FaCalendarAlt, FaVenusMars, FaNotesMedical } from 'react-icons/fa';

export default function QuestionnairePage() {
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
      router.push('/signup?redirect_url=/questionnaire');
    }
  }, [loading, user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
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
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FaHeartbeat className="text-primary" />
              Health Assessment Questionnaire
            </CardTitle>
            <CardDescription>
              Please provide your health information for a personalized assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FaUser className="text-muted-foreground" />
                  <Label htmlFor="name">Full Name</Label>
                </div>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-muted-foreground" />
                  <Label htmlFor="age">Age</Label>
                </div>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Enter your age"
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FaVenusMars className="text-muted-foreground" />
                  <Label htmlFor="gender">Gender</Label>
                </div>
                <Input
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  placeholder="Enter your gender"
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FaNotesMedical className="text-muted-foreground" />
                  <Label htmlFor="symptoms">Current Symptoms</Label>
                </div>
                <Textarea
                  id="symptoms"
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  placeholder="Describe your current symptoms"
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FaNotesMedical className="text-muted-foreground" />
                  <Label htmlFor="medicalHistory">Medical History</Label>
                </div>
                <Textarea
                  id="medicalHistory"
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  placeholder="Describe your medical history"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Submit Assessment
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
