"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPen, faPaperPlane, faSpinner } from "@fortawesome/free-solid-svg-icons";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  type Note,
} from "@/app/lib/services/admin/noteService";
import {
  showSuccessMessage,
  showErrorMessage,
  showConfirmation,
} from "@/app/lib/swalConfig";

interface NotesSectionProps {
  noteType: "order" | "customer";
  referenceId: string;
  title?: string;
}

export default function NotesSection({
  noteType,
  referenceId,
  title = "Notes",
}: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [inputContent, setInputContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [noteType, referenceId]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const fetchedNotes = await getNotes(noteType, referenceId);
      setNotes(fetchedNotes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      showErrorMessage("Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOrUpdateNote = async () => {
    if (!inputContent.trim()) return;

    setIsPosting(true);
    try {
      if (editingNoteId) {
        const updated = await updateNote(editingNoteId, {
          content: inputContent,
        });

        if (updated) {
          setNotes(
            notes.map((note) => (note.id === editingNoteId ? updated : note))
          );
          setEditingNoteId(null);
          setInputContent("");
          showSuccessMessage("Note updated successfully");
        }
      } else {
        const newNote = await createNote({
          note_type: noteType,
          reference_id: referenceId,
          content: inputContent,
        });

        if (newNote) {
          setNotes([newNote, ...notes]);
          setInputContent("");
          showSuccessMessage("Note added successfully");
        }
      }
    } catch (error) {
      console.error("Error saving note:", error);
      showErrorMessage("Failed to save note");
    } finally {
      setIsPosting(false);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setInputContent(note.content);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setInputContent("");
  };

  const handleDeleteNote = async (noteId: string) => {
    const result = await showConfirmation(
      "Delete Note",
      "Are you sure you want to delete this note? This action cannot be undone."
    );

    if (!result.isConfirmed) return;

    try {
      const success = await deleteNote(noteId);
      if (success) {
        setNotes(notes.filter((note) => note.id !== noteId));
        showSuccessMessage("Note deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      showErrorMessage("Failed to delete note");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${time}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${time}`;
    } else {
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `${dateStr} at ${time}`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm custom-border-1 overflow-hidden">
      {/* Compact Header */}
      <div className="border-b border-gray-line px-4 py-2.5">
        <h3 className="text-black small-semibold">{title}</h3>
      </div>

      <div className="p-3 space-y-2.5">
        {/* Compact Input Form */}
        <div className="space-y-2">
          <textarea
            className="w-full p-3 border border-gray-line rounded-md small text-gray-10 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent resize-none transition-all"
            placeholder={editingNoteId ? "Edit note..." : "Add note..."}
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            rows={3}
          />
          <div className="flex justify-between items-center">
            <span className="text-gray-110 xsmall">{inputContent.length}/500</span>
            <div className="flex gap-2">
              {editingNoteId && (
                <button
                  onClick={handleCancelEdit}
                  disabled={isPosting}
                  className="px-3 py-2 bg-gray-100 text-gray-800 rounded-md small-semibold hover:bg-gray-200 disabled:opacity-50 transition-all"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleAddOrUpdateNote}
                disabled={isPosting || !inputContent.trim()}
                className="px-4 py-2 bg-primary text-white rounded-md small-semibold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isPosting ? (
                  <FontAwesomeIcon icon={faSpinner} className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FontAwesomeIcon icon={faPaperPlane} className="h-3.5 w-3.5" />
                )}
                {editingNoteId ? "Update" : "Post"}
              </button>
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-3">
              <FontAwesomeIcon icon={faSpinner} className="h-3.5 w-3.5 text-primary animate-spin mr-1.5" />
              <span className="text-gray-10 xsmall">Loading...</span>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-3 text-gray-10 xsmall">No notes yet</div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className={`group border rounded-md p-2 transition-all text-xsmall ${
                  editingNoteId === note.id
                    ? "border-primary bg-primary/5"
                    : "border-gray-line hover:border-primary/30 hover:bg-primary/2"
                }`}
              >
                <p className="text-black leading-relaxed break-words mb-1">{note.content}</p>
                <div className="flex justify-between items-center">
                  <span className="text-gray-110 xsmall">{formatDate(note.createdAt)}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditNote(note)}
                      disabled={editingNoteId !== null && editingNoteId !== note.id}
                      className="p-1.5 text-gray-10 hover:text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faPen} className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      disabled={editingNoteId !== null}
                      className="p-1.5 text-gray-10 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
