interface UserModel {
  id: number;
  username: string;
  fullName: string;
  role: "admin" | "faculty" | "student";
}

interface SubjectModel {
  id: number;
  code: string;
  name: string;
  units: number;
  description: string;
}

interface FacultyModel {
  id: number;
  userId: number | null;
  employeeId: string;
  fullName: string;
  department: string;
  specialization: string;
}

interface FacultySubjectModel {
  id: number;
  facultyId: number;
  subjectId: number;
  code: string;
  name: string;
  units: number;
}

interface RoomModel {
  id: number;
  name: string;
  building: string;
  capacity: number;
}

interface SemesterModel {
  id: number;
  name: string;
  schoolYear: string;
  isActive: number;
}

interface ScheduleModel {
  id: number;
  subjectId: number;
  facultyId: number;
  roomId: number;
  semesterId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  employeeId: string;
  roomName: string;
  building: string;
  semesterName: string;
  schoolYear: string;
}
