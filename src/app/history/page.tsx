'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getPatientByEmail } from '@/lib/firebase/db';
import { Patient } from '@/lib/firebase/db';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientHistory = async () => {
      try {
        if (!email) {
          setError('No email provided');
          setLoading(false);
          return;
        }

        const patientData = await getPatientByEmail(email);
        if (patientData) {
          // Convert Firestore Timestamp to Date
          const formattedData: Patient = {
            ...patientData,
            createdAt: patientData.createdAt instanceof Date ? patientData.createdAt : new Date(patientData.createdAt.seconds * 1000),
            updatedAt: patientData.updatedAt instanceof Date ? patientData.updatedAt : new Date(patientData.updatedAt.seconds * 1000),
            analysisResults: patientData.analysisResults.map(result => ({
              ...result,
              timestamp: result.timestamp instanceof Date ? result.timestamp : new Date(result.timestamp.seconds * 1000)
            }))
          };
          setPatient(formattedData);
        } else {
          setPatient(null);
        }
      } catch (err) {
        console.error('Error fetching patient history:', err);
        setError('Failed to load patient history');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientHistory();
  }, [email]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="flex items-center space-x-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading patient history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/')}>Return Home</Button>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">No History Found</h2>
          <p className="text-gray-600 mb-4">No patient history found for this email address.</p>
          <Button onClick={() => router.push('/')}>Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Patient History</h1>
          
          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="font-medium">{patient.age}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-medium">{patient.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{patient.email}</p>
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Medical History</h2>
            <div className="space-y-2">
              {patient.medicalHistory.map((history, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-800">{history}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Previous Analyses */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Previous Analyses</h2>
            <div className="space-y-6">
              {patient.analysisResults.map((result, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    Analysis Date: {new Date(result.timestamp).toLocaleDateString()}
                  </p>
                  <div className="space-y-4">
                    {result.conditions.map((condition, cIndex) => (
                      <div key={cIndex} className="border-l-4 border-blue-500 pl-4">
                        <h3 className="font-semibold text-gray-800">{condition.condition}</h3>
                        <p className="text-sm text-gray-600">
                          Likelihood: {(condition.likelihood * 100).toFixed(1)}%
                        </p>
                        {condition.description && (
                          <p className="text-gray-700 mt-2">{condition.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Questionnaire Responses */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Questionnaire Responses</h2>
            <div className="space-y-4">
              {patient.questionnaireResponses.map((response, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded">
                  <p className="font-medium text-gray-800 mb-2">{response.question}</p>
                  <p className="text-gray-600">{response.answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => router.push('/')}>
              Return Home
            </Button>
            <Button onClick={() => router.push(`/manomedai?email=${encodeURIComponent(email)}`)}>
              New Analysis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 