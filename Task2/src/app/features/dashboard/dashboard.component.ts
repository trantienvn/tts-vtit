import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { StudentService } from '../../core/services/student.service';
import { Student } from '../../core/models/student.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzGridModule,
    NzStatisticModule,
    NzIconModule,
    NzProgressModule,
    NzTagModule,
    NzTableModule,
    NzButtonModule,
    NzAlertModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private studentService = inject(StudentService);

  totalStudents$!: Observable<number>;
  activeStudents$!: Observable<number>;
  graduatedStudents$!: Observable<number>;
  recentStudents$!: Observable<Student[]>;

  ngOnInit(): void {
    const allStudents$ = this.studentService.getStudents();
    
    this.totalStudents$ = allStudents$.pipe(map(list => list.length));
    this.activeStudents$ = allStudents$.pipe(map(list => list.filter(s => s.status === 'Active').length));
    this.graduatedStudents$ = allStudents$.pipe(map(list => list.filter(s => s.status === 'Graduated').length));
    this.recentStudents$ = allStudents$.pipe(map(list => list.slice(0, 5)));
  }
}
