import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { createCaseSchema, updateCaseSchema } from '@/lib/validation/schemas';
import type { UpdateCaseRequest } from '@/lib/validation/schemas';
import { CaseDoc, SerializedCase, ApiError } from '@/lib/types/backend';

export function serializeCase(id: string, data: Partial<CaseDoc>): SerializedCase {
  const title = data.title || data.name || 'Untitled Case';
  const name = data.name || data.title || title;
  const note = data.note || '';
  const symptoms = data.symptoms || data.selectedSymptoms?.map((symptom) => symptom.name) || [];
  const selectedSymptoms = data.selectedSymptoms || [];
  const results = data.results || [];
  const createdAtTs = data.createdAt || data.timestamp || Timestamp.now();
  const updatedAtTs = data.updatedAt || data.timestamp || createdAtTs;
  const timestampTs = data.timestamp || createdAtTs;

  return {
    id,
    title,
    name,
    note,
    bookId: data.bookId ?? null,
    symptoms,
    selectedSymptoms,
    results,
    userId: data.userId || '',
    createdAt: createdAtTs.toDate().toISOString(),
    updatedAt: updatedAtTs.toDate().toISOString(),
    timestamp: timestampTs.toDate().toISOString()
  };
}

function getCasesCollection(userId: string) {
  return getAdminDb().collection('cases').doc(userId).collection('items');
}

export async function listCases(userId: string): Promise<SerializedCase[]> {
  const casesSnapshot = await getCasesCollection(userId)
    .orderBy('createdAt', 'desc')
    .get();
  
  return casesSnapshot.docs.map((doc) => serializeCase(doc.id, doc.data() as Partial<CaseDoc>));
}

export async function createCase(userId: string, body: unknown): Promise<SerializedCase> {
  const validationResult = createCaseSchema.safeParse(body);
  if (!validationResult.success) {
    const error: ApiError = {
      code: 'INVALID_INPUT',
      message: 'Invalid request data',
      details: validationResult.error.issues
    };
    throw error;
  }
  
  const { title, name, note, bookId, symptoms, selectedSymptoms, results } = validationResult.data;

  const resolvedName = (name || title || 'Untitled Case').trim();
  const resolvedTitle = resolvedName;
  const now = Timestamp.now();
  const normalizedSelectedSymptoms = selectedSymptoms || [];
  const normalizedSymptoms = symptoms || normalizedSelectedSymptoms.map((symptom) => symptom.name);
  const normalizedResults = results || [];

  const newCase: CaseDoc = {
    title: resolvedTitle,
    name: resolvedName,
    note: note || '',
    ...(bookId ? { bookId } : {}),
    symptoms: normalizedSymptoms,
    selectedSymptoms: normalizedSelectedSymptoms,
    results: normalizedResults,
    userId,
    createdAt: now,
    updatedAt: now,
    timestamp: now
  };
  
  const caseRef = await getCasesCollection(userId).add(newCase);
  return serializeCase(caseRef.id, newCase);
}

function buildUpdateData(data: UpdateCaseRequest, existingData: Partial<CaseDoc>, now: FirebaseFirestore.Timestamp): Partial<CaseDoc> {
  const updateData: Partial<CaseDoc> = {
    updatedAt: now
  };

  if (data.title !== undefined || data.name !== undefined) {
    const resolvedName = (data.name || data.title || '').trim();
    if (resolvedName) {
      updateData.title = resolvedName;
      updateData.name = resolvedName;
    }
  }

  if (data.note !== undefined) {
    updateData.note = data.note;
  }

  if (data.bookId !== undefined) {
    updateData.bookId = data.bookId;
  }

  if (data.symptoms !== undefined) {
    updateData.symptoms = data.symptoms;
  }

  if (data.selectedSymptoms !== undefined) {
    updateData.selectedSymptoms = data.selectedSymptoms;
    if (data.symptoms === undefined) {
      updateData.symptoms = data.selectedSymptoms.map((symptom) => symptom.name);
    }
  }

  if (data.results !== undefined) {
    updateData.results = data.results;
  }

  if (!existingData.timestamp) {
    updateData.timestamp = existingData.createdAt || now;
  }

  return updateData;
}

export async function updateCase(userId: string, caseId: string, body: unknown): Promise<SerializedCase> {
  const validationResult = updateCaseSchema.safeParse(body);
  if (!validationResult.success) {
    const error: ApiError = {
      code: 'INVALID_INPUT',
      message: 'Invalid request data',
      details: validationResult.error.issues
    };
    throw error;
  }

  const caseRef = getCasesCollection(userId).doc(caseId);
  const caseDoc = await caseRef.get();
  if (!caseDoc.exists) {
    const error: ApiError = {
      code: 'NOT_FOUND',
      message: 'Case not found'
    };
    throw error;
  }

  const now = Timestamp.now();
  const existingData = caseDoc.data() as Partial<CaseDoc>;
  const updateData = buildUpdateData(validationResult.data, existingData, now);

  await caseRef.update(updateData);

  const updatedDoc = await caseRef.get();
  return serializeCase(updatedDoc.id, updatedDoc.data() as Partial<CaseDoc>);
}

export async function deleteCase(userId: string, caseId: string): Promise<void> {
  const caseRef = getCasesCollection(userId).doc(caseId);
  const caseDoc = await caseRef.get();
  
  if (!caseDoc.exists) {
    const error: ApiError = {
      code: 'NOT_FOUND',
      message: 'Case not found'
    };
    throw error;
  }

  await caseRef.delete();
}
