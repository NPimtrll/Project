import { IAudioFile } from "../../interfaces/IAudioFile";
import { IPDFFile } from "../../interfaces/IPDFFile";
import { ISession } from "../../interfaces/ISession";
import { IUser } from "../../interfaces/IUser";
import { IImageFile } from "../../interfaces/IImageFile";
import { IConversion } from "../../interfaces/IConversion";

export const apiUrl = "http://localhost:8080"; // ประกาศ apiUrl


interface LoginResponse {
  token: string;
  user: IUser;
}

async function getAudioFilesByUserId(userId: number): Promise<IAudioFile[]> {
  const response = await fetch(`${apiUrl}/users/${userId}/audio_files`);
  if (!response.ok) {
    throw new Error('Failed to fetch audio files');
  }
  
  const data = await response.json();
  
  // Debugging: Log the result to verify the content
  console.log('Audio Files Data:', data);
  
  // Check if data is an array
  if (data) {
    return data.data
  } else {
    throw new Error('Unexpected data format');
  }
}





// Audio File CRUD operations
// เพิ่มฟังก์ชันการดึงข้อมูลไฟล์เสียงของ PDF
async function getAudioFilesByPDFId(pdfId: number): Promise<IAudioFile[]> {
  const response = await fetch(`${apiUrl}/pdf_file/${pdfId}/audio_files`);
  return response.json();
}

async function getAudioFiles(): Promise<IAudioFile[]> {
  const response = await fetch(`${apiUrl}/audio-files`);
  return response.json();
}

async function getAudioFileById(id: number): Promise<IAudioFile> {
  const response = await fetch(`${apiUrl}/audio-file/${id}`);
  return response.json();
}

async function createAudioFile(audioFile: IAudioFile): Promise<IAudioFile> {
  const response = await fetch(`${apiUrl}/audio-file`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(audioFile),
  });
  return response.json();
}

async function updateAudioFile(id: number, audioFile: IAudioFile): Promise<IAudioFile> {
  const response = await fetch(`${apiUrl}/audio-file/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(audioFile),
  });
  return response.json();
}

async function deleteAudioFile(id: number): Promise<void> {
  await fetch(`${apiUrl}/audio-file/${id}`, { method: "DELETE" });
}


async function uploadPDF(file: File): Promise<{
  ID: number; audioUrl: string; Text?: string 
}> {
  const authToken = localStorage.getItem('authToken'); // Ensure 'authToken' is the correct key name

  const formData = new FormData();
  formData.append("file", file);

  const requestOptions: RequestInit = {
    method: "POST",
    body: formData,
    headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
  };

  const response = await fetch(`${apiUrl}/upload_pdf`, requestOptions);

  if (!response.ok) {
    throw new Error('Failed to upload PDF');
  }

  const result = await response.json();
  
  // Debugging: Log the result to verify the content
  console.log('Upload Response:', result);

  return result;
}




async function deletePDF(id: number): Promise<void> {
await fetch(`${apiUrl}/pdf_file/${id}`, { method: "DELETE" });
}

// Session CRUD operations
async function getSessions(): Promise<ISession[]> {
  const response = await fetch(`${apiUrl}/sessions`);
  return response.json();
}

async function getSessionById(id: number): Promise<ISession> {
  const response = await fetch(`${apiUrl}/session/${id}`);
  return response.json();
}

async function createSession(session: ISession): Promise<ISession> {
  const response = await fetch(`${apiUrl}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session),
  });
  return response.json();
}

async function updateSession(id: number, session: ISession): Promise<ISession> {
  const response = await fetch(`${apiUrl}/session/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session),
  });
  return response.json();
}

async function deleteSession(token: string): Promise<void> {
  const requestOptions: RequestInit = {
    method: "DELETE",
    headers: { 'Authorization': `Bearer ${token}` }
  };
  await fetch(`${apiUrl}/session`, requestOptions);
}



// User CRUD operations
async function getUsers(): Promise<IUser[]> {
  const response = await fetch(`${apiUrl}/users`);
  return response.json();
}

async function getUserById(id: number): Promise<IUser> {
  const response = await fetch(`${apiUrl}/user/${id}`);
  return response.json();
}

async function createUser(user: IUser): Promise<IUser> {
  const response = await fetch(`${apiUrl}/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return response.json();
}

async function updateUser(id: number, user: IUser): Promise<IUser> {
  const response = await fetch(`${apiUrl}/user/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return response.json();
}

async function deleteUser(id: number): Promise<void> {
  await fetch(`${apiUrl}/user/${id}`, { method: "DELETE" });
}

// Image File CRUD operations
async function getImageFiles(): Promise<IImageFile[]> {
  const response = await fetch(`${apiUrl}/image-files`);
  return response.json();
}

async function getImageFileById(id: number): Promise<IImageFile> {
  const response = await fetch(`${apiUrl}/image-file/${id}`);
  return response.json();
}

async function createImageFile(imageFile: IImageFile): Promise<IImageFile> {
  const response = await fetch(`${apiUrl}/image-file`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(imageFile),
  });
  return response.json();
}

async function updateImageFile(id: number, imageFile: IImageFile): Promise<IImageFile> {
  const response = await fetch(`${apiUrl}/image-file/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(imageFile),
  });
  return response.json();
}

async function deleteImageFile(id: number): Promise<void> {
  await fetch(`${apiUrl}/image-file/${id}`, { method: "DELETE" });
}

// Conversion CRUD operations
async function getConversions(): Promise<IConversion[]> {
  const response = await fetch(`${apiUrl}/conversions`);
  return response.json();
}

async function getConversionById(id: number): Promise<IConversion> {
  const response = await fetch(`${apiUrl}/conversion/${id}`);
  return response.json();
}

async function createConversion(conversion: IConversion): Promise<IConversion> {
  const response = await fetch(`${apiUrl}/conversions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(conversion),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create conversion');
  }

  return response.json(); // ต้องแน่ใจว่า API ส่งกลับข้อมูลที่ตรงตาม IConversion
}



async function updateConversion(id: number, conversion: IConversion): Promise<IConversion> {
  const response = await fetch(`${apiUrl}/conversion/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(conversion),
  });
  return response.json();
}

async function deleteConversion(id: number): Promise<void> {
  await fetch(`${apiUrl}/conversion/${id}`, { method: "DELETE" });
}

async function getConversionStatus(id: number): Promise<{ status: string; audioUrl?: string }> {
  const response = await fetch(`${apiUrl}/conversions/${id}/status`);
  if (!response.ok) {
      throw new Error('Failed to fetch conversion status');
  }
  const data = await response.json();
  return data;
}



async function loginUser(credentials: { username: string; password: string }): Promise<LoginResponse> {
  const response = await fetch(`${apiUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error('Invalid username or password');
  }

  return response.json();
}

export {
  getAudioFilesByPDFId,
  getAudioFilesByUserId,
  getAudioFiles,
  getAudioFileById,
  createAudioFile,
  updateAudioFile,
  deleteAudioFile,
  uploadPDF,
  deletePDF,
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getImageFiles,
  getImageFileById,
  createImageFile,
  updateImageFile,
  deleteImageFile,
  getConversions,
  getConversionById,
  createConversion,
  updateConversion,
  deleteConversion,
  getConversionStatus,
  loginUser
};
