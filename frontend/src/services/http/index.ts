import { IAudioFile } from "../../interfaces/IAudioFile";
import { IPDFFile } from "../../interfaces/IPDFFile";
import { ISession } from "../../interfaces/ISession";
import { IUser } from "../../interfaces/IUser";
import { IImageFile } from "../../interfaces/IImageFile";
import { IConversion } from "../../interfaces/IConversion";

const apiUrl = "http://localhost:8080";

// Audio File CRUD operations
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

// PDF File CRUD operations
async function uploadPDF(file: File): Promise<IPDFFile> {
    const formData = new FormData();
    formData.append("pdf", file);
  
    const requestOptions = {
      method: "POST",
      body: formData,
    };
  
    const response = await fetch(`${apiUrl}/upload_pdf`, requestOptions);
    return response.json();
  }
  
async function getPDFs(): Promise<IPDFFile[]> {
  const response = await fetch(`${apiUrl}/pdfs`);
  return response.json();
}

async function getPDFById(id: number): Promise<IPDFFile> {
  const response = await fetch(`${apiUrl}/pdf/${id}`);
  return response.json();
}


async function updatePDF(id: number, pdf: IPDFFile): Promise<IPDFFile> {
  const response = await fetch(`${apiUrl}/pdf/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pdf),
  });
  return response.json();
}

async function deletePDF(id: number): Promise<void> {
  await fetch(`${apiUrl}/pdf/${id}`, { method: "DELETE" });
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

async function deleteSession(id: number): Promise<void> {
  await fetch(`${apiUrl}/session/${id}`, { method: "DELETE" });
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
  const response = await fetch(`${apiUrl}/conversion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(conversion),
  });
  return response.json();
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

export {
  getAudioFiles,
  getAudioFileById,
  createAudioFile,
  updateAudioFile,
  deleteAudioFile,
  getPDFs,
  getPDFById,
  uploadPDF,
  updatePDF,
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
};
