import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, updateDoc } from 'firebase/firestore';
import { app } from './config';

const db = getFirestore(app);

export interface MedicalRecord {
  id: string;
  userId: string;
  date: string;
  name: string;
  age: string;
  gender: string;
  symptoms: string;
  medicalHistory: string;
  diagnosis: string;
  recommendations: string;
  questionnaireResponses?: Record<string, string>;
}

export async function saveMedicalRecord(record: Omit<MedicalRecord, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'medicalRecords'), {
      ...record,
      date: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving medical record:', error);
    throw error;
  }
}

export async function getUserMedicalRecords(userId: string) {
  try {
    const q = query(
      collection(db, 'medicalRecords'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MedicalRecord[];
  } catch (error) {
    console.error('Error fetching medical records:', error);
    throw error;
  }
}

export async function saveQuestionnaireResponses(
  recordId: string,
  responses: Record<string, string>
) {
  try {
    const recordRef = collection(db, 'medicalRecords');
    const q = query(recordRef, where('id', '==', recordId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        questionnaireResponses: responses
      });
    }
  } catch (error) {
    console.error('Error saving questionnaire responses:', error);
    throw error;
  }
} 