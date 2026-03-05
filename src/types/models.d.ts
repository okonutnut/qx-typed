interface UserModel {
  id: number;
  username: string;
  full_name: string;
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
  user_id: number | null;
  employee_id: string;
  full_name: string;
  department: string;
  specialization: string;
}

interface FacultySubjectModel {
  id: number;
  faculty_id: number;
  subject_id: number;
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
  school_year: string;
  is_active: number;
}

interface ScheduleModel {
  id: number;
  subject_id: number;
  faculty_id: number;
  room_id: number;
  semester_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject_code: string;
  subject_name: string;
  faculty_name: string;
  employee_id: string;
  room_name: string;
  building: string;
  semester_name: string;
  school_year: string;
}
