import { db } from './config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';

// Types
export interface Patient {
  id?: string;
  name: string;
  age: string;
  gender: string;
  email: string;
  symptoms: string[];
  medicalHistory: string[];
  questionnaireResponses: {
    question: string;
    answer: string;
  }[];
  analysisResults: {
    conditions: {
      condition: string;
      likelihood: number;
      description: string;
    }[];
    timestamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Add a new patient record
export const addPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'patients'), {
      ...patientData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding patient:', error);
    throw error;
  }
};

// Get all patients
export const getAllPatients = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'patients'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting patients:', error);
    throw error;
  }
};

// Get patient by ID
export const getPatientById = async (id: string) => {
  try {
    const docRef = doc(db, 'patients', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting patient:', error);
    throw error;
  }
};

// Get patient by email
export const getPatientByEmail = async (email: string): Promise<Patient | null> => {
  try {
    const q = query(collection(db, 'patients'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const data = querySnapshot.docs[0].data();
    return {
      id: querySnapshot.docs[0].id,
      name: data.name,
      age: data.age,
      gender: data.gender,
      email: data.email,
      symptoms: data.symptoms,
      medicalHistory: data.medicalHistory,
      questionnaireResponses: data.questionnaireResponses,
      analysisResults: data.analysisResults,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    } as Patient;
  } catch (error) {
    console.error('Error getting patient by email:', error);
    throw error;
  }
};

// Add analysis results to patient
export const addAnalysisResults = async (patientId: string, results: Patient['analysisResults'][0]) => {
  try {
    const docRef = doc(db, 'patients', patientId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Patient not found');
    }

    const currentResults = docSnap.data().analysisResults || [];
    
    await updateDoc(docRef, {
      analysisResults: [...currentResults, results],
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error adding analysis results:', error);
    throw error;
  }
}; 