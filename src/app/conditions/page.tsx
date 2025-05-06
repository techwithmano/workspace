'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { symptomAnalysis, SymptomAnalysisOutput } from '@/ai/flows/symptom-analysis';
import { ConditionDisplay } from '@/components/ConditionDisplay';
import { Disclaimer } from '@/components/Disclaimer';
import { Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Download, History } from 'lucide-react';
import { addPatient, addAnalysisResults } from '@/lib/firebase/db';

function ConditionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const name = searchParams.get('name') || '';
  const age = searchParams.get('age') || '';
  const gender = searchParams.get('gender') || '';
  const email = searchParams.get('email') || '';
  const symptoms = searchParams.get('symptoms') || '';
  const medicalHistory = searchParams.get('medicalHistory') || '';
  const answersRaw = searchParams.get('answers') || '[]';

  const [conditions, setConditions] = useState<SymptomAnalysisOutput | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchConditions = async () => {
      try {
        // Decode and parse answers
        const decodedAnswers = decodeURIComponent(answersRaw);
        const parsedAnswers: string[] = JSON.parse(decodedAnswers);

        const result = await symptomAnalysis({
          symptoms,
          medicalHistory,
          questionnaireAnswers: parsedAnswers.join(','),
        });

        setConditions(result);

        // Save patient data to Firebase
        try {
          const patientData = {
            name: decodeURIComponent(name),
            age: decodeURIComponent(age),
            gender: decodeURIComponent(gender),
            email: decodeURIComponent(email),
            symptoms: decodeURIComponent(symptoms).split(',').map(s => s.trim()),
            medicalHistory: decodeURIComponent(medicalHistory).split(',').map(h => h.trim()),
            questionnaireResponses: questions.map((question, index) => ({
              question,
              answer: parsedAnswers[index] || ''
            })),
            analysisResults: [{
              conditions: result.map(condition => ({
                ...condition,
                description: condition.description || 'No description available'
              })),
              timestamp: new Date()
            }]
          };

          const patientId = await addPatient(patientData);
          console.log('Patient data saved successfully:', patientId);
        } catch (error) {
          console.error('Error saving patient data:', error);
        }
      } catch (err) {
        console.error("Symptom analysis failed:", err);
        setConditions(null);
      }
    };

    fetchConditions();
  }, [symptoms, medicalHistory, answersRaw, name, age, gender, email, questions]);

  // PDF download function
  const downloadPDF = () => {
    try {
      // Set up A4 page dimensions (in mm)
      const doc = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      });
      
      // A4 dimensions
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      
      // Professional margins (in mm)
      const margin = {
        top: 25,
        bottom: 25,
        left: 25,
        right: 25
      };
      
      // Content width calculation
      const contentWidth = pageWidth - (margin.left + margin.right);
      
      // Spacing constants (in mm)
      const spacing = {
        section: 20,    // Space between major sections
        paragraph: 12,  // Space between paragraphs
        line: 6,        // Space between lines
        small: 4        // Small spacing
      };

      // Color scheme - Professional medical theme
      const colors = {
        primary: [0, 32, 96],        // Deep Navy Blue
        secondary: [248, 250, 252],  // Light Gray
        accent: [0, 102, 204],       // Bright Blue
        text: [51, 51, 51],          // Dark Gray
        warning: [220, 38, 38],      // Red
        success: [16, 185, 129],     // Green
        border: [226, 232, 240]      // Border Color
      };

      let yOffset = margin.top;
      let currentPage = 1;

      // Helper function to add header
      const addHeader = () => {
        // Logo and title
        doc.setFontSize(24);
        doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('ManoMed AI', margin.left, yOffset);
        
        // Subtitle
        doc.setFontSize(16);
        doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.text('Medical Analysis Report', margin.left, yOffset + 8);
        
        // Date
        doc.setFontSize(10);
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin.left, yOffset + 16);
        
        // Page number
        doc.text(`Page ${currentPage}`, pageWidth - margin.right - 20, yOffset);
        
        yOffset += 25;
      };

      // Helper function to add footer
      const addFooter = () => {
        const footerY = pageHeight - margin.bottom;
        
        // Company info
        doc.setFontSize(10);
        doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('ManoMed AI', margin.left, footerY);
        
        // Contact info
        doc.setFont('helvetica', 'normal');
        doc.text('Contact: officialtechwithmano@gmail.com', margin.left, footerY + 6);
        
        // Social media
        doc.text('linktr.ee/techwithmano', pageWidth - margin.right - 45, footerY);
        doc.text('manomedai.com', pageWidth - margin.right - 45, footerY + 6);
        
        // Copyright
        doc.text(`© ${new Date().getFullYear()} ManoMed AI. All rights reserved.`, margin.left, footerY + 12);
      };

      // Helper function to check if we need a new page
      const checkNewPage = (requiredSpace: number) => {
        if (yOffset + requiredSpace > pageHeight - margin.bottom - 30) {
          doc.addPage();
          currentPage++;
          yOffset = margin.top;
          addHeader();
          return true;
        }
        return false;
      };

      // Helper function to create a section
      const createSection = (title: string) => {
        checkNewPage(30);
        
        // Section title
        doc.setFontSize(14);
        doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin.left, yOffset);
        
        // Underline
        doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
        doc.setLineWidth(0.5);
        doc.line(margin.left, yOffset + 2, margin.left + 100, yOffset + 2);
        
        yOffset += 12;
      };

      // Start with header
      addHeader();

      // Personal Information Section
      createSection('Personal Information');
      
      const personalInfo = [
        { label: 'Name', value: decodeURIComponent(name) },
        { label: 'Age', value: decodeURIComponent(age) },
        { label: 'Gender', value: decodeURIComponent(gender) },
        { label: 'Email', value: decodeURIComponent(email) }
      ];
      
      personalInfo.forEach(info => {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.text(`${info.label}:`, margin.left, yOffset);
        
        doc.setFont('helvetica', 'normal');
        doc.text(info.value, margin.left + 30, yOffset);
        yOffset += spacing.line;
      });

      yOffset += spacing.section;

      // Symptoms Section
      createSection('Reported Symptoms');
      
      const decodedSymptoms = decodeURIComponent(symptoms);
      const symptomsList = decodedSymptoms.split(',').map(s => s.trim());
      
      symptomsList.forEach(symptom => {
        checkNewPage(spacing.line);
        doc.setFontSize(11);
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.text(`• ${symptom}`, margin.left, yOffset);
        yOffset += spacing.line;
      });

      yOffset += spacing.section;

      // Medical History Section
      createSection('Medical History');
      yOffset += 10;
      
      const decodedMedicalHistory = decodeURIComponent(medicalHistory);
      const medicalHistoryList = decodedMedicalHistory.split(',').map(h => h.trim());
      
      if (medicalHistoryList.length > 0 && medicalHistoryList[0] !== '') {
        medicalHistoryList.forEach(history => {
          checkNewPage(spacing.line);
          doc.setFontSize(11);
          doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
          doc.text(`• ${history}`, margin.left, yOffset);
          yOffset += spacing.line;
      });
    } else {
        doc.setFontSize(11);
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.text('No significant medical history reported', margin.left, yOffset);
        yOffset += spacing.line;
      }

      yOffset += spacing.section;

      // Questionnaire Section
      const questions = [
        "How long have you been experiencing these symptoms?",
        "Have you noticed any changes in your weight recently?",
        "Do you have a family history of diabetes?",
        "Have you been feeling more tired than usual?",
        "Have you noticed any changes in your vision?",
        "Have you been drinking more water than usual?",
        "Have you been urinating more frequently?",
        "Have you noticed any changes in your appetite?",
        "Have you been experiencing any other symptoms?",
        "Have you consulted a doctor about these symptoms before?"
      ];

      const decodedAnswers = decodeURIComponent(answersRaw);
      const parsedAnswers: string[] = JSON.parse(decodedAnswers);

      // Force new page for questionnaire
      doc.addPage();
      currentPage++;
      yOffset = margin.top;
      addHeader();
      createSection('Questionnaire Responses');
      yOffset += 10;

      parsedAnswers.forEach((answer, index) => {
        checkNewPage(spacing.line * 3);

        // Question
        doc.setFontSize(11);
        doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${questions[index]}`, margin.left, yOffset);
        
        // Answer
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.text(`   ${answer || 'No answer provided'}`, margin.left, yOffset + spacing.line);
        
        yOffset += spacing.line * 2;
      });

      yOffset += spacing.section;

      // Conditions Section
      // Force new page for conditions
      doc.addPage();
      currentPage++;
      yOffset = margin.top;
      addHeader();
      createSection('Potential Conditions');
      yOffset += 10;

      if (conditions) {
        conditions.forEach((condition, index) => {
          checkNewPage(spacing.line * 4);

          // Condition name
          doc.setFontSize(12);
          doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
          doc.setFont('helvetica', 'bold');
          doc.text(`${index + 1}. ${condition.condition}`, margin.left, yOffset);
          
          // Likelihood
          const likelihood = condition.likelihood * 100;
          const likelihoodColor = likelihood > 70 ? colors.warning : 
                                likelihood > 30 ? colors.success : 
                                colors.text;
          
          doc.setFontSize(10);
          doc.setTextColor(likelihoodColor[0], likelihoodColor[1], likelihoodColor[2]);
          doc.text(`   Likelihood: ${likelihood.toFixed(2)}%`, margin.left, yOffset + spacing.line);
          
          // Description
          if (condition.description) {
            doc.setFontSize(10);
            doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
            const splitDesc = doc.splitTextToSize(condition.description, contentWidth);
            doc.text(splitDesc, margin.left + 10, yOffset + spacing.line * 2);
            yOffset += spacing.line * (splitDesc.length + 1);
          }
          
          yOffset += spacing.paragraph;
        });
      }

      // Add footer to all pages
      for (let i = 1; i <= currentPage; i++) {
        doc.setPage(i);
        addFooter();
    }

    // Save PDF
      doc.save('ManoMed_AI_Analysis_Report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    }
  };

  // Loading or results state
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      {conditions ? (
        <>
          <div className="w-full max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-primary">Analysis Results</h2>
              <div className="flex gap-4">
                <Button 
                  onClick={() => router.push(`/history?email=${encodeURIComponent(email)}`)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <History className="w-4 h-4" />
                  View History
                </Button>
                <Button 
                  onClick={downloadPDF}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </Button>
              </div>
            </div>
          <ConditionDisplay conditions={conditions} />
          <div className="mt-6">
            <Disclaimer />
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center space-x-4 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Analyzing symptoms...</span>
        </div>
      )}
    </div>
  );
}

// Main Page with Suspense fallback
export default function ConditionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
          <div className="flex items-center space-x-4 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      }
    >
      <ConditionsContent />
    </Suspense>
  );
}
