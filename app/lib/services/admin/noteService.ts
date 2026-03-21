import axiosInstance from "../../axiosConfig";

export interface Note {
  id: string;
  note_type: "order" | "customer";
  reference_id: string;
  content: string;
  created_by?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  note_type: "order" | "customer";
  reference_id: string;
  content: string;
}

export interface UpdateNoteRequest {
  content: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

const BASE_URL = "/admin/notes";

// Create a new note
export async function createNote(
  data: CreateNoteRequest
): Promise<Note | null> {
  try {
    const response = await axiosInstance.post<ApiResponse<Note>>(BASE_URL, data);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
}

// Get notes for a specific reference
export async function getNotes(
  noteType: "order" | "customer",
  referenceId: string
): Promise<Note[]> {
  try {
    const response = await axiosInstance.get<ApiResponse<Note[]>>(BASE_URL, {
      params: {
        note_type: noteType,
        reference_id: referenceId,
      },
    });
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw error;
  }
}

// Update a note
export async function updateNote(
  noteId: string,
  data: UpdateNoteRequest
): Promise<Note | null> {
  try {
    const response = await axiosInstance.put<ApiResponse<Note>>(`${BASE_URL}/${noteId}`, data);
    return response.data?.data || null;
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
}

// Delete a note
export async function deleteNote(noteId: string): Promise<boolean> {
  try {
    await axiosInstance.delete<ApiResponse<null>>(`${BASE_URL}/${noteId}`);
    return true;
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
}
