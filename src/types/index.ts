export interface User {
  _id: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  name: string;
  createdAt: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  previewUrl: string;
  teacherId: User;
  isApproved: boolean;
  approvedBy: User | null;
  approvedAt: string | null;
  videos: Video[];
  createdAt: string;
}

export interface Video {
  _id: string;
  title: string;
  url: string;
  courseId: string;
  order: number;
  isPreview: boolean;
  createdAt: string;
}

export interface Progress {
  _id: string;
  userId: string;
  courseId: string;
  videoId: string;
  completed: boolean;
  createdAt: string;
}

export interface TeacherApplication {
  _id: string;
  userId: User;
  documents: {
    title: string;
    url: string;
    uploadedAt: string;
  }[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}