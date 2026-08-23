import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, Subject, BehaviorSubject, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, takeUntil, tap, map, startWith, retry, finalize, catchError } from 'rxjs/operators';

// NG-ZORRO Modules
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzAlertModule } from 'ng-zorro-antd/alert';

import { StudentService } from '../../core/services/student.service';
import { Student, SchoolClass } from '../../core/models/student.model';

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
    NzInputNumberModule,
    NzTooltipModule,
    NzBadgeModule,
    NzAlertModule
  ],
  templateUrl: './students.component.html',
  styleUrl: './students.component.scss'
})
export class StudentsComponent implements OnInit, OnDestroy {
  private studentService = inject(StudentService);
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private notification = inject(NzNotificationService);

  // Subject for takeUntil unsubscribe pattern
  private destroy$ = new Subject<void>();
  private refresh$ = new BehaviorSubject<void>(undefined);

  searchControl = new FormControl('', { nonNullable: true });
  classFilterControl = new FormControl('ALL', { nonNullable: true });
  statusFilterControl = new FormControl('ALL', { nonNullable: true });

  students$!: Observable<Student[]>;
  classes: SchoolClass[] = [];
  isLoading = false;
  searchStatusText = 'Sẵn sàng tìm kiếm...';

  // Modal State
  isModalVisible = false;
  isEditMode = false;
  currentStudentId: string | null = null;
  studentForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadClasses();
    this.setupReactiveSearch();
  }

  initForm(): void {
    this.studentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      gender: ['Nam', [Validators.required]],
      className: ['', [Validators.required]],
      birthDate: [null, [Validators.required]],
      gpa: [3.0, [Validators.required, Validators.min(0), Validators.max(4.0)]],
      status: ['Active', [Validators.required]]
    });
  }

  loadClasses(): void {
    this.studentService.getClasses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.classes = res;
          // Set default className in form once classes load
          if (this.classes.length > 0 && !this.studentForm.get('className')?.value) {
            this.studentForm.patchValue({ className: this.classes[0].name });
          }
        },
        error: (err) => {
          console.error('Lỗi khi tải danh sách lớp học:', err);
          this.message.error('Không thể tải danh sách lớp học!');
        }
      });
  }

  // Week 3 Task 3: combineLatest filter combining:
  // - Search text changes with debounceTime and distinctUntilChanged
  // - Class filter changes
  // - Status filter changes
  // Uses switchMap, retry(2), catchError, and finalize loading management
  setupReactiveSearch(): void {
    const search$ = this.searchControl.valueChanges.pipe(
      startWith(this.searchControl.value),
      debounceTime(350),
      distinctUntilChanged(),
      filter(term => {
        const trimmed = term.trim();
        const isValid = trimmed.length === 0 || trimmed.length >= 2;
        if (!isValid) {
          this.searchStatusText = 'Nhập ít nhất 2 ký tự để tìm kiếm...';
        }
        return isValid;
      })
    );

    const class$ = this.classFilterControl.valueChanges.pipe(
      startWith(this.classFilterControl.value),
      distinctUntilChanged()
    );

    const status$ = this.statusFilterControl.valueChanges.pipe(
      startWith(this.statusFilterControl.value),
      distinctUntilChanged()
    );

    this.students$ = this.refresh$.pipe(
      takeUntil(this.destroy$),
      switchMap(() =>
        combineLatest([search$, class$, status$]).pipe(
          tap(([q, cls, stat]) => {
            this.isLoading = true;
            this.searchStatusText = 'Đang tìm kiếm & lọc kết quả...';
          }),
          switchMap(([q, cls, stat]) =>
            this.studentService.getStudentsFiltered(q, cls, stat).pipe(
              retry(2), // retry twice in case of connection drop
              catchError(error => {
                console.error('Error fetching filtered students:', error);
                this.message.error('Lỗi hệ thống khi tải danh sách sinh viên!');
                return of<Student[]>([]); // recover with empty list
              }),
              finalize(() => {
                this.isLoading = false;
                this.searchStatusText = 'Hoàn thành tải dữ liệu';
              })
            )
          )
        )
      )
    );
  }

  reloadList(): void {
    this.refresh$.next();
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.currentStudentId = null;
    this.studentForm.reset({
      gender: 'Nam',
      className: this.classes.length > 0 ? this.classes[0].name : '',
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
      this.studentService.updateStudent(this.currentStudentId, payload)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (res) => {
            this.isModalVisible = false;
            this.reloadList();
            this.notification.success('Thành công', `Đã cập nhật sinh viên ${res.name}`);
          },
          error: (err) => {
            console.error('Update error:', err);
            this.message.error('Lỗi khi cập nhật sinh viên!');
          }
        });
    } else {
      this.studentService.addStudent(payload)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (res) => {
            this.isModalVisible = false;
            this.reloadList();
            this.notification.success('Thành công', `Đã thêm sinh viên mới: ${res.name} (${res.id})`);
          },
          error: (err) => {
            console.error('Insert error:', err);
            this.message.error('Lỗi khi thêm sinh viên mới!');
          }
        });
    }
  }

  deleteStudent(id: string): void {
    this.isLoading = true;
    this.studentService.deleteStudent(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: () => {
          this.reloadList();
          this.message.success(`Đã xóa thành công sinh viên ID: ${id}`);
        },
        error: (err) => {
          console.error('Delete error:', err);
          this.message.error('Không thể xóa sinh viên này!');
        }
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe all active subscriptions safely
    this.destroy$.next();
    this.destroy$.complete();
  }
}
