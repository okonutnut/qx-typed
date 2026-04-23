interface ProposedSchedule {
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  employeeId: string;
  roomName: string;
  building: string;
  day: string;
  startTime: string;
  endTime: string;
  units: number;
}

interface AISchedulerParams {
  subjects: SubjectModel[];
  facultySubjects: FacultySubjectModel[];
  faculty: FacultyModel[];
  rooms: RoomModel[];
  existingSchedules: ScheduleModel[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const START_HOUR = 7;
const END_HOUR = 21;
const HOUR_DURATION = 0.5;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const pad = (n: number) => (n < 10 ? "0" + n : "" + n);
  return `${pad(h)}:${pad(m)}`;
}

function timesOverlap(
  day1: string,
  start1: string,
  end1: string,
  day2: string,
  start2: string,
  end2: string,
): boolean {
  if (day1 !== day2) return false;
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
}

function hasConflict(
  proposed: ProposedSchedule[],
  existing: ScheduleModel[],
  day: string,
  startTime: string,
  endTime: string,
  facultyId: number,
  roomId: number,
  facultyMap: Map<string, number>,
  roomMap: Map<string, number>,
): boolean {
  const key = (id: number, name: string) => `${name}:${id}`;
  for (const p of proposed) {
    const pFacId = facultyMap.get(p.facultyName) ?? -1;
    const pRoomId = roomMap.get(p.roomName) ?? -1;
    if (
      (pFacId === facultyId || pRoomId === roomId) &&
      timesOverlap(p.day, p.startTime, p.endTime, day, startTime, endTime)
    ) {
      return true;
    }
  }
  for (const e of existing) {
    const eDay = Array.isArray(e.dayOfWeek) ? e.dayOfWeek[0] : e.dayOfWeek;
    const eFacId = e.facultyId;
    const eRoomId = e.roomId;
    if (
      (eFacId === facultyId || eRoomId === roomId) &&
      timesOverlap(eDay, e.startTime, e.endTime, day, startTime, endTime)
    ) {
      return true;
    }
  }
  return false;
}

function generate(params: AISchedulerParams): ProposedSchedule[] {
  const proposed: ProposedSchedule[] = [];
  const facultyMap = new Map(params.faculty.map((f) => [f.fullName, f.id]));
  const roomMap = new Map(params.rooms.map((r) => [r.name, r.id]));
  const facultySubjectMap = new Map<number, FacultyModel[]>();

  for (const fs of params.facultySubjects) {
    const fac = params.faculty.find((f) => f.id === fs.facultyId);
    if (fac) {
      const existing = facultySubjectMap.get(fs.subjectId) ?? [];
      existing.push(fac);
      facultySubjectMap.set(fs.subjectId, existing);
    }
  }

  const subjectsToSchedule = [...params.subjects];
  const sortByUnits = (a: SubjectModel, b: SubjectModel) => b.units - a.units;
  subjectsToSchedule.sort(sortByUnits);

  for (const subject of subjectsToSchedule) {
    const eligibleFaculty = facultySubjectMap.get(subject.id) ?? [];
    if (eligibleFaculty.length === 0) {
      continue;
    }
    const fac = eligibleFaculty[0];
    let scheduled = false;

    for (const day of DAYS) {
      for (let hour = START_HOUR; hour < END_HOUR; hour++) {
        const startTime = minutesToTime(hour * 60);
        const durationHours = subject.units * HOUR_DURATION;
        const endMinutes = hour * 60 + durationHours * 60;
        if (endMinutes > END_HOUR * 60) continue;
        const endTime = minutesToTime(endMinutes);

        for (const room of params.rooms) {
          const facId = fac.id;
          const roomId = room.id;

          if (
            !hasConflict(
              proposed,
              params.existingSchedules,
              day,
              startTime,
              endTime,
              facId,
              roomId,
              facultyMap,
              roomMap,
            )
          ) {
            proposed.push({
              subjectCode: subject.code,
              subjectName: subject.name,
              facultyName: fac.fullName,
              employeeId: fac.employeeId,
              roomName: room.name,
              building: room.building,
              day: day,
              startTime: startTime,
              endTime: endTime,
              units: subject.units,
            });
            scheduled = true;
            break;
          }
        }
        if (scheduled) break;
      }
      if (scheduled) break;
    }
  }

  return proposed;
}

const SchedulerLocal = { generate };

class SchedulerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SchedulerError";
  }
}