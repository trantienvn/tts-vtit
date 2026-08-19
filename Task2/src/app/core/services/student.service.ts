import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, from } from 'rxjs';
import { delay, map, filter, take, tap, toArray } from 'rxjs/operators';
import { Student } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private initialStudents: Student[] = [
    { id: 'STD2026001', name: 'Nguyễn Văn Anh', email: 'vananh@ictu.edu.vn', gender: 'Nam', className: 'CNTT K22K', birthDate: '2005-05-15', gpa: 3.82, status: 'Active' },
    { id: 'STD2026002', name: 'Trần Thị Bình', email: 'thibinh@ictu.edu.vn', gender: 'Nữ', className: 'CNTT K22A', birthDate: '2004-08-20', gpa: 3.65, status: 'Active' },
    { id: 'STD2026003', name: 'Lê Hoàng Cường', email: 'hoangcuong@ictu.edu.vn', gender: 'Nam', className: 'KTPM K20B', birthDate: '2003-11-10', gpa: 3.90, status: 'Graduated' },
    { id: 'STD2026004', name: 'Phạm Minh Đức', email: 'minhduc@ictu.edu.vn', gender: 'Nam', className: 'HTTT K22C', birthDate: '2005-02-28', gpa: 2.95, status: 'Active' },
    { id: 'STD2026005', name: 'Vũ Thanh Em', email: 'thanhem@ictu.edu.vn', gender: 'Nữ', className: 'CNTT K22D', birthDate: '2004-09-05', gpa: 2.40, status: 'Suspended' },
    { id: 'STD2026006', name: 'Đoàn Hải Phong', email: 'haiphong@ictu.edu.vn', gender: 'Nam', className: 'KTPM K22E', birthDate: '2004-12-12', gpa: 3.50, status: 'Active' },
    { id: 'STD2026007', name: 'Hoàng Thị Giang', email: 'thigiang@ictu.edu.vn', gender: 'Nữ', className: 'CNTT K22A', birthDate: '2005-01-14', gpa: 3.75, status: 'Active' },
    { id: 'STD2026008', name: 'Bùi Văn Hùng', email: 'vanhung@ictu.edu.vn', gender: 'Nam', className: 'HTTT K22C', birthDate: '2004-04-18', gpa: 3.10, status: 'Active' }
  ];

  private studentsSubject$ = new BehaviorSubject<Student[]>(this.initialStudents);
  public students$: Observable<Student[]> = this.studentsSubject$.asObservable();

  getStudents(): Observable<Student[]> {
    return this.students$;
  }

  // Search API simulation with delay to observe switchMap cancellation
  searchStudents(query: string): Observable<Student[]> {
    const q = query.trim().toLowerCase();
    const filtered = this.studentsSubject$.value.filter(s =>
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.className.toLowerCase().includes(q)
    );
    // Simulate server latency (400ms)
    return of(filtered).pipe(delay(400));
  }

  // Operator Demo 1: map, filter, take
  getTopHonorStudents(minGpa: number = 3.5, limit: number = 3): Observable<Student[]> {
    return from(this.studentsSubject$.value).pipe(
      filter(student => student.gpa >= minGpa),
      take(limit),
      toArray()
    );
  }

  // Single detail fetch (for mergeMap / concatMap demos)
  getStudentById(id: string, latencyMs: number = 600): Observable<Student> {
    const student = this.studentsSubject$.value.find(s => s.id === id);
    if (!student) {
      throw new Error(`Student ${id} not found`);
    }
    return of(student).pipe(delay(latencyMs));
  }

  addStudent(studentData: Omit<Student, 'id'>): Observable<Student> {
    const newId = 'STD' + (2026000 + this.studentsSubject$.value.length + 1);
    const newStudent: Student = {
      ...studentData,
      id: newId
    };

    return of(newStudent).pipe(
      delay(400),
      tap(created => {
        const currentList = this.studentsSubject$.value;
        this.studentsSubject$.next([created, ...currentList]);
      })
    );
  }

  updateStudent(id: string, updatedData: Partial<Student>): Observable<Student> {
    const currentList = this.studentsSubject$.value;
    const index = currentList.findIndex(s => s.id === id);

    if (index === -1) {
      throw new Error(`Student with ID ${id} not found.`);
    }

    const updatedStudent: Student = {
      ...currentList[index],
      ...updatedData
    };

    const newList = [...currentList];
    newList[index] = updatedStudent;

    return of(updatedStudent).pipe(
      delay(400),
      tap(() => this.studentsSubject$.next(newList))
    );
  }

  deleteStudent(id: string): Observable<boolean> {
    return of(true).pipe(
      delay(300),
      tap(() => {
        const currentList = this.studentsSubject$.value;
        const updatedList = currentList.filter(s => s.id !== id);
        this.studentsSubject$.next(updatedList);
      })
    );
  }
}
