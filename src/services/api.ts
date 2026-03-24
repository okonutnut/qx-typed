const GRAPHQL_ENDPOINT = "http://localhost:5032/graphql";

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

async function gql<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  console.log("[API] Query:", query.substring(0, 100), "variables:", variables);
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const result: GraphQLResponse<T> = await response.json();
  console.log("[API] Response:", result);

  if (result.errors && result.errors.length > 0) {
    throw new Error(result.errors[0].message);
  }

  if (!result.data) {
    throw new Error("No data returned from GraphQL");
  }

  return result.data;
}

const Queries = {
  users: () => gql<{ users: UserModel[] }>(`query { users { id username fullName: fullName role } }`),
  user: (id: number) => gql<{ user: UserModel | null }>(`query($id: Int!) { user(id: $id) { id username fullName: fullName role } }`, { id }),

  subjects: () => gql<{ subjects: SubjectModel[] }>(`query { subjects { id code name units description } }`),
  subject: (id: number) => gql<{ subject: SubjectModel | null }>(`query($id: Int!) { subject(id: $id) { id code name units description } }`, { id }),

  faculties: () => gql<{ faculties: FacultyModel[] }>(`query { faculties { id userId: userId employeeId: employeeId fullName: fullName department specialization } }`),
  faculty: (id: number) => gql<{ faculty: FacultyModel | null }>(`query($id: Int!) { faculty(id: $id) { id userId: userId employeeId: employeeId fullName: fullName department specialization } }`, { id }),

  rooms: () => gql<{ rooms: RoomModel[] }>(`query { rooms { id name building capacity } }`),
  room: (id: number) => gql<{ room: RoomModel | null }>(`query($id: Int!) { room(id: $id) { id name building capacity } }`, { id }),

  semesters: () => gql<{ semesters: SemesterModel[] }>(`query { semesters { id name schoolYear: schoolYear isActive: isActive } }`),
  semester: (id: number) => gql<{ semester: SemesterModel | null }>(`query($id: Int!) { semester(id: $id) { id name schoolYear: schoolYear isActive: isActive } }`, { id }),
  activeSemester: () => gql<{ activeSemester: SemesterModel | null }>(`query { activeSemester { id name schoolYear: schoolYear isActive: isActive } }`),

  schedules: () => gql<{ schedules: ScheduleModel[] }>(`query { schedules { id subjectId: subjectId facultyId: facultyId roomId: roomId semesterId: semesterId dayOfWeek: dayOfWeek startTime: startTime endTime: endTime subjectCode: subjectCode subjectName: subjectName facultyName: facultyName employeeId: employeeId roomName: roomName building semesterName: semesterName schoolYear: schoolYear } }`),
  schedule: (id: number) => gql<{ schedule: ScheduleModel | null }>(`query($id: Int!) { schedule(id: $id) { id subjectId: subjectId facultyId: facultyId roomId: roomId semesterId: semesterId dayOfWeek: dayOfWeek startTime: startTime endTime: endTime subjectCode: subjectCode subjectName: subjectName facultyName: facultyName employeeId: employeeId roomName: roomName building semesterName: semesterName schoolYear: schoolYear } }`, { id }),

  facultySubjects: () => gql<{ facultySubjects: FacultySubjectModel[] }>(`query { facultySubjects { id facultyId: facultyId subjectId: subjectId code name units } }`),
  facultySubjectsByFaculty: (facultyId: number) => gql<{ facultySubjectsByFaculty: FacultySubjectModel[] }>(`query($facultyId: Int!) { facultySubjectsByFaculty(facultyId: $facultyId) { id facultyId: facultyId subjectId: subjectId code name units } }`, { facultyId }),
};

const Mutations = {
  createSubject: (code: string, name: string, units: number, description: string) =>
    gql<{ createSubject: SubjectModel }>(`mutation($code: String!, $name: String!, $units: Int!, $description: String!) { createSubject(code: $code, name: $name, units: $units, description: $description) { id code name units description } }`, { code, name, units, description }),

  updateSubject: (id: number, code: string, name: string, units: number, description: string) =>
    gql<{ updateSubject: SubjectModel | null }>(`mutation($id: Int!, $code: String!, $name: String!, $units: Int!, $description: String!) { updateSubject(id: $id, code: $code, name: $name, units: $units, description: $description) { id code name units description } }`, { id, code, name, units, description }),

  deleteSubject: (id: number) =>
    gql<{ deleteSubject: boolean }>(`mutation($id: Int!) { deleteSubject(id: $id) }`, { id }),

  createFaculty: (userId: number | null, employeeId: string, fullName: string, department: string, specialization: string) =>
    gql<{ createFaculty: FacultyModel }>(`mutation($userId: Int, $employeeId: String!, $fullName: String!, $department: String!, $specialization: String!) { createFaculty(userId: $userId, employeeId: $employeeId, fullName: $fullName, department: $department, specialization: $specialization) { id userId: userId employeeId: employeeId fullName: fullName department specialization } }`, { userId, employeeId, fullName, department, specialization }),

  updateFaculty: (id: number, userId: number | null, employeeId: string, fullName: string, department: string, specialization: string) =>
    gql<{ updateFaculty: FacultyModel | null }>(`mutation($id: Int!, $userId: Int, $employeeId: String!, $fullName: String!, $department: String!, $specialization: String!) { updateFaculty(id: $id, userId: $userId, employeeId: $employeeId, fullName: $fullName, department: $department, specialization: $specialization) { id userId: userId employeeId: employeeId fullName: fullName department specialization } }`, { id, userId, employeeId, fullName, department, specialization }),

  deleteFaculty: (id: number) =>
    gql<{ deleteFaculty: boolean }>(`mutation($id: Int!) { deleteFaculty(id: $id) }`, { id }),

  createRoom: (name: string, building: string, capacity: number) =>
    gql<{ createRoom: RoomModel }>(`mutation($name: String!, $building: String!, $capacity: Int!) { createRoom(name: $name, building: $building, capacity: $capacity) { id name building capacity } }`, { name, building, capacity }),

  updateRoom: (id: number, name: string, building: string, capacity: number) =>
    gql<{ updateRoom: RoomModel | null }>(`mutation($id: Int!, $name: String!, $building: String!, $capacity: Int!) { updateRoom(id: $id, name: $name, building: $building, capacity: $capacity) { id name building capacity } }`, { id, name, building, capacity }),

  deleteRoom: (id: number) =>
    gql<{ deleteRoom: boolean }>(`mutation($id: Int!) { deleteRoom(id: $id) }`, { id }),

  createSemester: (name: string, schoolYear: string, isActive: number) =>
    gql<{ createSemester: SemesterModel }>(`mutation($name: String!, $schoolYear: String!, $isActive: Int!) { createSemester(name: $name, schoolYear: $schoolYear, isActive: $isActive) { id name schoolYear: schoolYear isActive: isActive } }`, { name, schoolYear, isActive }),

  updateSemester: (id: number, name: string, schoolYear: string, isActive: number) =>
    gql<{ updateSemester: SemesterModel | null }>(`mutation($id: Int!, $name: String!, $schoolYear: String!, $isActive: Int!) { updateSemester(id: $id, name: $name, schoolYear: $schoolYear, isActive: $isActive) { id name schoolYear: schoolYear isActive: isActive } }`, { id, name, schoolYear, isActive }),

  deleteSemester: (id: number) =>
    gql<{ deleteSemester: boolean }>(`mutation($id: Int!) { deleteSemester(id: $id) }`, { id }),

  createSchedule: (subjectId: number, facultyId: number, roomId: number, semesterId: number, dayOfWeek: string, startTime: string, endTime: string) =>
    gql<{ createSchedule: ScheduleModel }>(`mutation($subjectId: Int!, $facultyId: Int!, $roomId: Int!, $semesterId: Int!, $dayOfWeek: String!, $startTime: String!, $endTime: String!) { createSchedule(subjectId: $subjectId, facultyId: $facultyId, roomId: $roomId, semesterId: $semesterId, dayOfWeek: $dayOfWeek, startTime: $startTime, endTime: $endTime) { id subjectId: subjectId facultyId: facultyId roomId: roomId semesterId: semesterId dayOfWeek: dayOfWeek startTime: startTime endTime: endTime subjectCode: subjectCode subjectName: subjectName facultyName: facultyName employeeId: employeeId roomName: roomName building semesterName: semesterName schoolYear: schoolYear } }`, { subjectId, facultyId, roomId, semesterId, dayOfWeek, startTime, endTime }),

  updateSchedule: (id: number, subjectId: number, facultyId: number, roomId: number, semesterId: number, dayOfWeek: string, startTime: string, endTime: string) =>
    gql<{ updateSchedule: ScheduleModel | null }>(`mutation($id: Int!, $subjectId: Int!, $facultyId: Int!, $roomId: Int!, $semesterId: Int!, $dayOfWeek: String!, $startTime: String!, $endTime: String!) { updateSchedule(id: $id, subjectId: $subjectId, facultyId: $facultyId, roomId: $roomId, semesterId: $semesterId, dayOfWeek: $dayOfWeek, startTime: $startTime, endTime: $endTime) { id subjectId: subjectId facultyId: facultyId roomId: roomId semesterId: semesterId dayOfWeek: dayOfWeek startTime: startTime endTime: endTime subjectCode: subjectCode subjectName: subjectName facultyName: facultyName employeeId: employeeId roomName: roomName building semesterName: semesterName schoolYear: schoolYear } }`, { id, subjectId, facultyId, roomId, semesterId, dayOfWeek, startTime, endTime }),

  deleteSchedule: (id: number) =>
    gql<{ deleteSchedule: boolean }>(`mutation($id: Int!) { deleteSchedule(id: $id) }`, { id }),
};

const Api = { Queries, Mutations };

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}
