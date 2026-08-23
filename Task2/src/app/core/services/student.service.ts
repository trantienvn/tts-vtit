import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Student, SchoolClass, StudentStatistics } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private http = inject(HttpClient);
  private apiPrefix = '/api';

  // 1. Fetch all students
  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiPrefix}/students`);
  }

  // 2. Search students by text query
  searchStudents(query: string): Observable<Student[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Student[]>(`${this.apiPrefix}/students`, { params });
  }

  // 3. Advanced Filtering using combineLatest
  getStudentsFiltered(q?: string, className?: string, status?: string): Observable<Student[]> {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    if (className && className !== 'ALL') params = params.set('className', className);
    if (status && status !== 'ALL') params = params.set('status', status);

    return this.http.get<Student[]>(`${this.apiPrefix}/students`, { params });
  }

  // 4. Fetch details of a single student (demonstrating mergeMap / concatMap)
  getStudentById(id: string, latencyMs?: number): Observable<Student> {
    const obs = this.http.get<Student>(`${this.apiPrefix}/students/${id}`);
    return latencyMs ? obs.pipe(delay(latencyMs)) : obs;
  }

  // 5. Add new student
  addStudent(studentData: Omit<Student, 'id'>): Observable<Student> {
    return this.http.post<Student>(`${this.apiPrefix}/students`, studentData);
  }

  // 6. Update student details
  updateStudent(id: string, updatedData: Partial<Student>): Observable<Student> {
    return this.http.put<Student>(`${this.apiPrefix}/students/${id}`, updatedData);
  }

  // 7. Delete a student
  deleteStudent(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiPrefix}/students/${id}`);
  }

  // 8. Fetch list of classes (for combineLatest filter & Dashboard)
  getClasses(): Observable<SchoolClass[]> {
    return this.http.get<SchoolClass[]>(`${this.apiPrefix}/classes`);
  }

  // 9. Fetch dynamic statistics (for forkJoin dashboard)
  getStatistics(): Observable<StudentStatistics> {
    return this.http.get<StudentStatistics>(`${this.apiPrefix}/statistics`);
  }

  // 10. Simulate API errors (for error handling demonstration)
  getStudentsWithErrorSimulation(simulateError?: string, simulateTimeout?: boolean): Observable<Student[]> {
    let params = new HttpParams();
    if (simulateError) {
      params = params.set('simulateError', simulateError);
    }
    if (simulateTimeout) {
      params = params.set('simulateTimeout', 'true');
    }
    return this.http.get<Student[]>(`${this.apiPrefix}/students`, { params });
  }
}
