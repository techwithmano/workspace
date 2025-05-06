'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FaHeartbeat, FaStethoscope, FaUserMd, FaChartLine } from 'react-icons/fa';

const HomePage = () => {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-primary mb-6 flex items-center justify-center gap-3">
            <FaHeartbeat className="text-6xl" />
            ManoMed AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your personal AI-powered health companion. Get instant health assessments and personalized medical insights.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            className="h-12 px-8 text-lg"
            onClick={() => router.push('/manomedai')}
          >
            <FaStethoscope className="mr-2" />
            Start Assessment
          </Button>
          {!user && (
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 text-lg"
              onClick={() => router.push('/signup')}
            >
              <FaUserMd className="mr-2" />
              Sign Up
            </Button>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose ManoMed AI?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <FaStethoscope className="text-4xl text-primary mb-4" />
              <CardTitle>AI-Powered Assessment</CardTitle>
              <CardDescription>
                Get instant health assessments powered by advanced AI technology.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FaUserMd className="text-4xl text-primary mb-4" />
              <CardTitle>Personalized Insights</CardTitle>
              <CardDescription>
                Receive tailored health recommendations based on your symptoms and history.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FaChartLine className="text-4xl text-primary mb-4" />
              <CardTitle>Health Tracking</CardTitle>
              <CardDescription>
                Monitor your health progress and track your medical history over time.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Take Control of Your Health?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start your health assessment journey today with ManoMed AI.
            </p>
            <Button
              size="lg"
              className="h-12 px-8 text-lg"
              onClick={() => router.push('/manomedai')}
            >
              <FaStethoscope className="mr-2" />
              Get Started Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
