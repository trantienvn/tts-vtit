import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// NG-ZORRO Modules
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzDrawerModule, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

import { StudentService } from '../../core/services/student.service';
import { Student } from '../../core/models/student.model';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzDropdownModule,
    NzPopconfirmModule,
    NzModalModule,
    NzDrawerModule,
    NzSpinModule,
    NzFormModule,
    NzSelectModule,
    NzRadioModule,
    NzDatePickerModule,
    NzInputNumberModule
  ],
  templateUrl: './students.component.html',
  styleUrl: './students.component.scss'
})
export class StudentsComponent implements OnInit {
  private studentService = inject(StudentService);
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private notification = inject(NzNotificationService);

  students$!: Observable<Student[]>;
  searchValue = '';
  isLoading = false;

  // Modal State
  isModalVisible = false;
  isEditMode = false;
  currentStudentId: string | null = null;
  studentForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadStudents();
  }

  initForm(): void {
    this.studentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      gender: ['Nam', [Validators.required]],
      className: ['CNTT-K65', [Validators.required]],
      birthDate: [null, [Validators.required]],
      gpa: [3.0, [Validators.required, Validators.min(0), Validators.max(4.0)]],
      status: ['Active', [Validators.required]]
    });
  }

  loadStudents(): void {
    this.students$ = this.studentService.getStudents().pipe(
      map(list => {
        if (!this.searchValue.trim()) return list;
        const q = this.searchValue.toLowerCase();
        return list.filter(
          s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
        );
      })
    );
  }

  onSearchChange(): void {
    this.loadStudents();
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.currentStudentId = null;
    this.studentForm.reset({
      gender: 'Nam',
      className: 'CNTT-K65',
      gpa: 3.2,
      status: 'Active'
    });
    this.isModalVisible = true;
  }

  openEditModal(student: Student): void {
    this.isEditMode = true;
    this.currentStudentId = student.id;
    this.studentForm.patchValue({
      name: student.name,
      email: student.email,
      gender: student.gender,
      className: student.className,
      birthDate: new Date(student.birthDate),
      gpa: student.gpa,
      status: student.status
    });
    this.isModalVisible = true;
  }

  handleModalCancel(): void {
    this.isModalVisible = false;
  }

  submitForm(): void {
    if (this.studentForm.invalid) {
      Object.values(this.studentForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.message.warning('Vui lòng điền đầy đủ và chính xác thông tin sinh viên!');
      return;
    }

    this.isLoading = true;
    const formVal = this.studentForm.value;
    const birthDateStr = formVal.birthDate instanceof Date
      ? formVal.birthDate.toISOString().split('T')[0]
      : formVal.birthDate;

    const payload = {
      ...formVal,
      birthDate: birthDateStr
    };

    if (this.isEditMode && this.currentStudentId) {
      this.studentService.updateStudent(this.currentStudentId, payload).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.isModalVisible = false;
          this.loadStudents();
          this.notification.success('Thành công', `Đã cập nhật sinh viên ${res.name}`);
        },
        error: (err) => {
          this.isLoading = false;
          this.message.error('Lỗi khi cập nhật sinh viên!');
        }
      });
    } else {
      this.studentService.addStudent(payload).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.isModalVisible = false;
          this.loadStudents();
          this.notification.success('Thành công', `Đã thêm sinh viên mới: ${res.name} (${res.id})`);
        },
        error: (err) => {
          this.isLoading = false;
          this.message.error('Lỗi khi thêm sinh viên mới!');
        }
      });
    }
  }

  deleteStudent(id: string): void {
    this.isLoading = true;
    this.studentService.deleteStudent(id).subscribe({
      next: () => {
        this.isLoading = false;
        this.loadStudents();
        this.message.success(`Đã xóa sinh viên ID: ${id}`);
      },
      error: () => {
        this.isLoading = false;
        this.message.error('Không thể xóa sinh viên!');
      }
    });
  }
}
