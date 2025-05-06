import { db } from './config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';

// Types
export interface MedicalRecord {
  age: number;
  gender: string;
  conditions: string[];
  medications: string[];
  allergies: string[];
  lastUpdated: string;
}

export interface Questionnaire {
  id: string;
  userId: string;
  timestamp: string;
  symptoms: string[];
  severity: number;
  duration: string;
  notes: string;
}

export interface Assessment {
  id: string;
  userId: string;
  questionnaireId: string;
  timestamp: string;
  diagnosis: string;
  recommendations: string[];
  followUpDate: string;
}

// Medical Records
export const saveMedicalRecord = async (userId: string, data: Omit<MedicalRecord, 'lastUpdated'>) => {
  try {
    const medicalRecord: MedicalRecord = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    await setDoc(doc(db, 'medicalRecords', userId), medicalRecord);
  } catch (error) {
    console.error('Error saving medical record:', error);
    throw error;
  }
};

export const getMedicalRecord = async (userId: string) => {
  try {
    const docRef = doc(db, 'medicalRecords', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as MedicalRecord : null;
  } catch (error) {
    console.error('Error getting medical record:', error);
    throw error;
  }
};

// Questionnaires
export const saveQuestionnaire = async (userId: string, data: Omit<Questionnaire, 'id' | 'userId' | 'timestamp'>) => {
  try {
    const questionnaireRef = doc(collection(db, 'questionnaires'));
    const questionnaire: Questionnaire = {
      id: questionnaireRef.id,
      userId,
      timestamp: new Date().toISOString(),
      ...data,
    };
    await setDoc(questionnaireRef, questionnaire);
    return questionnaire;
  } catch (error) {
    console.error('Error saving questionnaire:', error);
    throw error;
  }
};

export const getUserQuestionnaires = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'questionnaires'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Questionnaire);
  } catch (error) {
    console.error('Error getting user questionnaires:', error);
    throw error;
  }
};

// Assessments
export const saveAssessment = async (userId: string, questionnaireId: string, data: Omit<Assessment, 'id' | 'userId' | 'questionnaireId' | 'timestamp'>) => {
  try {
    const assessmentRef = doc(collection(db, 'assessments'));
    const assessment: Assessment = {
      id: assessmentRef.id,
      userId,
      questionnaireId,
      timestamp: new Date().toISOString(),
      ...data,
    };
    await setDoc(assessmentRef, assessment);
    return assessment;
  } catch (error) {
    console.error('Error saving assessment:', error);
    throw error;
  }
};

export const getUserAssessments = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'assessments'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Assessment);
  } catch (error) {
    console.error('Error getting user assessments:', error);
    throw error;
  }
}; 