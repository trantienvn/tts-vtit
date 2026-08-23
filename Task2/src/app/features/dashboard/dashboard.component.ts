import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { StudentService } from '../../core/services/student.service';
import { Student, SchoolClass, StudentStatistics } from '../../core/models/student.model';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzCardModule,
    NzGridModule,
    NzStatisticModule,
    NzIconModule,
    NzProgressModule,
    NzTagModule,
    NzTableModule,
    NzButtonModule,
    NzAlertModule,
    NzSpinModule,
    NzSkeletonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private studentService = inject(StudentService);

  isLoading = true;
  hasError = false;
  errorMessage = '';

  // Data variables
  students: Student[] = [];
  classes: SchoolClass[] = [];
  statistics: StudentStatistics = {
    totalCount: 0,
    activeCount: 0,
    graduatedCount: 0,
    suspendedCount: 0,
    averageGpa: 0.0
  };
  recentStudents: Student[] = [];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.hasError = false;

    forkJoin({
      students: this.studentService.getStudents(),
      classes: this.studentService.getClasses(),
      statistics: this.studentService.getStatistics()
    }).pipe(
      catchError(error => {
        console.error('Error loading dashboard data with forkJoin:', error);
        this.hasError = true;
        this.errorMessage = 'Không thể kết nối đến Mock API Server. Vui lòng kiểm tra xem server.js đã được khởi chạy chưa!';
        // Return default values so pipeline doesn't crash completely
        return of({
          students: [],
          classes: [],
          statistics: { totalCount: 0, activeCount: 0, graduatedCount: 0, suspendedCount: 0, averageGpa: 0.0 }
        });
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(data => {
      this.students = data.students;
      this.classes = data.classes;
      this.statistics = data.statistics;
      // Get 5 recent students
      this.recentStudents = data.students.slice(0, 5);
    });
  }
}
