import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subject, Observable, of, from } from 'rxjs';
import {
  map,
  filter,
  take,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  concatMap,
  mergeMap,
  takeUntil,
  throttleTime,
  tap,
  toArray,
  delay
} from 'rxjs/operators';

// NG-ZORRO Modules
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzProgressModule } from 'ng-zorro-antd/progress';

import { StudentService } from '../../core/services/student.service';
import { Student } from '../../core/models/student.model';
import { SubCleanupDemoComponent } from './sub-cleanup-demo.component';

export interface LogItem {
  timestamp: string;
  source: string;
  value: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

@Component({
  selector: 'app-rxjs-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzCardModule,
    NzTagModule,
    NzTabsModule,
    NzSliderModule,
    NzRadioModule,
    NzBadgeModule,
    NzTableModule,
    NzSpinModule,
    NzAlertModule,
    NzProgressModule,
    SubCleanupDemoComponent
  ],
  templateUrl: './rxjs-demo.component.html',
  styleUrl: './rxjs-demo.component.scss'
})
export class RxjsDemoComponent implements OnInit, OnDestroy {
  private studentService = inject(StudentService);
  private destroy$ = new Subject<void>();

  selectedTabIndex = 0;
  logs: LogItem[] = [];

  // ==========================================
  // DEMO 1: Basic Operators (map, filter, take)
  // ==========================================
  minGpaThreshold = 3.5;
  takeLimit = 3;
  rawStudentsList: Student[] = [];
  basicOperatorResult: any[] = [];
  basicOperatorLogs: string[] = [];

  // ==========================================
  // DEMO 2: Search Demo (valueChanges + debounce + distinct + filter)
  // ==========================================
  demo2SearchControl = new FormControl('', { nonNullable: true });
  demo2RawInputLog: string[] = [];
  demo2DebouncedValue = '';
  demo2DistinctValue = '';
  demo2FilteredValue = '';
  demo2SearchResults: Student[] = [];
  demo2IsLoading = false;

  // ==========================================
  // DEMO 3: switchMap Demo (Request Cancellation)
  // ==========================================
  switchMapTrigger$ = new Subject<string>();
  switchMapStatus = 'Sẵn sàng';
  switchMapActiveQuery = '';
  switchMapResults: Student[] = [];
  switchMapRequestCount = 0;

  // ==========================================
  // DEMO 4: concatMap Demo (Sequential Tasks Execution)
  // ==========================================
  concatMapTrigger$ = new Subject<{ id: string; name: string; taskNo: number }>();
  concatMapProgress = 0;
  concatMapLogs: string[] = [];
  concatMapIsRunning = false;

  // ==========================================
  // DEMO 5: mergeMap Demo (Concurrent Multi-Fetch)
  // ==========================================
  mergeMapResults: { id: string; name: string; latency: number; completedAt: string }[] = [];
  mergeMapIsRunning = false;

  // ==========================================
  // DEMO 6: debounceTime vs throttleTime
  // ==========================================
  clickStream$ = new Subject<number>();
  rawClickCount = 0;
  debouncedClickCount = 0;
  throttledClickCount = 0;
  lastDebouncedTime = '-';
  lastThrottledTime = '-';

  // ==========================================
  // DEMO 7: Subscription & takeUntil Demo
  // ==========================================
  isChildMounted = false;
  cleanupStrategy: 'leak' | 'takeUntil' | 'asyncPipe' = 'takeUntil';

  ngOnInit(): void {
    this.studentService.getStudents().pipe(takeUntil(this.destroy$)).subscribe(list => {
      this.rawStudentsList = list;
      this.runBasicOperatorPipeline();
    });

    this.setupDemo2ReactiveSearch();
    this.setupDemo3SwitchMap();
    this.setupDemo4ConcatMap();
    this.setupDemo6ThrottleDebounce();
  }

  // ------------------------------------------
  // DEMO 1 Logic: map, filter, take
  // ------------------------------------------
  runBasicOperatorPipeline(): void {
    this.basicOperatorLogs = [];
    this.addLog('Basic Operators', `Chạy pipeline với GPA >= ${this.minGpaThreshold}, take(${this.takeLimit})`, 'info');

    from(this.rawStudentsList).pipe(
      tap(s => this.basicOperatorLogs.push(`📥 Raw item: ${s.name} (GPA: ${s.gpa})`)),
      filter(s => s.gpa >= this.minGpaThreshold),
      tap(s => this.basicOperatorLogs.push(`✅ Filter passed (GPA >= ${this.minGpaThreshold}): ${s.name}`)),
      take(this.takeLimit),
      tap(s => this.basicOperatorLogs.push(`🎯 Taken: ${s.name}`)),
      map(s => ({
        id: s.id,
        name: s.name.toUpperCase(),
        gpaFormatted: `${s.gpa.toFixed(2)} / 4.00`,
        honorBadge: s.gpa >= 3.8 ? 'Xuất Sắc (Summa Cum Laude)' : 'Giỏi (Magna Cum Laude)'
      })),
      tap(s => this.basicOperatorLogs.push(`✨ Transformed (map): ${s.name} - ${s.honorBadge}`)),
      toArray()
    ).subscribe(result => {
      this.basicOperatorResult = result;
      this.addLog('Basic Operators', `Pipeline hoàn thành. Kết quả thu được ${result.length} phần tử`, 'success');
    });
  }

  // ------------------------------------------
  // DEMO 2 Logic: Search Pipeline
  // ------------------------------------------
  private setupDemo2ReactiveSearch(): void {
    const filteredQuery$ = this.demo2SearchControl.valueChanges.pipe(
      takeUntil(this.destroy$),
      tap((val: string) => {
        const time = new Date().toLocaleTimeString();
        this.demo2RawInputLog.unshift(`[${time}] Raw input: "${val}"`);
        if (this.demo2RawInputLog.length > 5) this.demo2RawInputLog.pop();
      }),
      debounceTime(400),
      tap((val: string) => {
        this.demo2DebouncedValue = val;
        this.addLog('Search Pipeline', `debounceTime(400ms) phát ra: "${val}"`, 'info');
      }),
      distinctUntilChanged(),
      tap((val: string) => {
        this.demo2DistinctValue = val;
        this.addLog('Search Pipeline', `distinctUntilChanged() qua cửa: "${val}"`, 'info');
      }),
      filter((val: string) => {
        const trimmed = val.trim();
        const isValid = trimmed.length === 0 || trimmed.length >= 2;
        this.demo2FilteredValue = isValid ? val : '(Bị chặn bởi filter - độ dài < 2)';
        return isValid;
      })
    );

    filteredQuery$.pipe(
      tap((val: string) => {
        this.demo2IsLoading = true;
        this.addLog('Search Pipeline', `filter() duyệt thành công query: "${val}". Đang gọi API...`, 'success');
      }),
      switchMap((query: string) => this.studentService.searchStudents(query))
    ).subscribe((results: Student[]) => {
      this.demo2IsLoading = false;
      this.demo2SearchResults = results;
      this.addLog('Search Pipeline', `Nhận về ${results.length} kết quả sinh viên`, 'success');
    });
  }

  // ------------------------------------------
  // DEMO 3 Logic: switchMap Request Cancellation
  // ------------------------------------------
  private setupDemo3SwitchMap(): void {
    this.switchMapTrigger$.pipe(
      takeUntil(this.destroy$),
      tap(query => {
        this.switchMapRequestCount++;
        const currentReqId = this.switchMapRequestCount;
        this.switchMapActiveQuery = query;
        this.switchMapStatus = `Đang xử lý Request #${currentReqId} ("${query}")...`;
        this.addLog('switchMap', `Khởi chạy Request #${currentReqId} cho query: "${query}"`, 'info');
      }),
      switchMap(query => {
        const reqId = this.switchMapRequestCount;
        return this.studentService.searchStudents(query).pipe(
          tap(() => {
            this.addLog('switchMap', `✅ Request #${reqId} ("${query}") ĐÃ HOÀN THÀNH thành công!`, 'success');
          })
        );
      })
    ).subscribe(results => {
      this.switchMapResults = results;
      this.switchMapStatus = `Đã hoàn thành request mới nhất với ${results.length} kết quả!`;
    });
  }

  triggerRapidSwitchMapRequests(): void {
    this.switchMapResults = [];
    this.switchMapRequestCount = 0;
    this.addLog('switchMap Demo', 'Bắt đầu gửi 3 requests liên tục cực nhanh...', 'warning');

    setTimeout(() => this.switchMapTrigger$.next('Nguyễ'), 0);
    setTimeout(() => {
      this.addLog('switchMap Demo', '⚡ Request #1 ("Nguyễ") BỊ HỦY vì Request #2 phát ra!', 'error');
      this.switchMapTrigger$.next('Trần');
    }, 150);
    setTimeout(() => {
      this.addLog('switchMap Demo', '⚡ Request #2 ("Trần") BỊ HỦY vì Request #3 phát ra!', 'error');
      this.switchMapTrigger$.next('Lê');
    }, 300);
  }

  // ------------------------------------------
  // DEMO 4 Logic: concatMap Sequential Execution
  // ------------------------------------------
  private setupDemo4ConcatMap(): void {
    this.concatMapTrigger$.pipe(
      takeUntil(this.destroy$),
      tap(task => {
        this.concatMapLogs.push(`[Hàng Đợi] Task #${task.taskNo} (${task.name}) đã vào hàng chờ concatMap.`);
        this.addLog('concatMap', `Task #${task.taskNo} vào queue`, 'info');
      }),
      concatMap(task => {
        this.concatMapLogs.push(`▶️ [Đang Chạy] Task #${task.taskNo} (${task.name}) bắt đầu thực thi (chờ 800ms)...`);
        this.addLog('concatMap', `Bắt đầu Task #${task.taskNo}`, 'warning');
        return of(task).pipe(
          delay(800),
          tap(t => {
            this.concatMapLogs.push(`✅ [Hoàn Thành] Task #${t.taskNo} (${t.name}) đã xử lý xong!`);
            this.addLog('concatMap', `Hoàn thành Task #${t.taskNo}`, 'success');
          })
        );
      })
    ).subscribe(completedTask => {
      this.concatMapProgress = Math.min(100, this.concatMapProgress + 33.4);
      if (this.concatMapProgress >= 99) {
        this.concatMapIsRunning = false;
        this.addLog('concatMap', 'Tất cả các Task tuần tự đã hoàn thành 100%', 'success');
      }
    });
  }

  triggerConcatMapSequence(): void {
    this.concatMapLogs = [];
    this.concatMapProgress = 0;
    this.concatMapIsRunning = true;
    this.addLog('concatMap Demo', 'Đẩy 3 công việc liên tục vào stream concatMap...', 'info');

    const tasks = [
      { id: 'STD2026001', name: 'Nguyễn Văn Anh', taskNo: 1 },
      { id: 'STD2026002', name: 'Trần Thị Bình', taskNo: 2 },
      { id: 'STD2026003', name: 'Lê Hoàng Cường', taskNo: 3 }
    ];

    tasks.forEach(t => this.concatMapTrigger$.next(t));
  }

  // ------------------------------------------
  // DEMO 5 Logic: mergeMap Concurrent Multi-Fetch
  // ------------------------------------------
  triggerMergeMapConcurrent(): void {
    this.mergeMapResults = [];
    this.mergeMapIsRunning = true;
    this.addLog('mergeMap Demo', 'Khởi chạy đồng thời 4 HTTP Fetch requests (mergeMap)...', 'info');

    const items = [
      { id: 'STD2026001', latency: 900 },
      { id: 'STD2026002', latency: 400 },
      { id: 'STD2026003', latency: 1200 },
      { id: 'STD2026004', latency: 600 }
    ];

    from(items).pipe(
      takeUntil(this.destroy$),
      mergeMap(item => {
        this.addLog('mergeMap', `Khởi tạo Fetch cho ${item.id} (Dự kiến: ${item.latency}ms)`, 'info');
        return this.studentService.getStudentById(item.id, item.latency).pipe(
          map(student => ({
            id: student.id,
            name: student.name,
            latency: item.latency,
            completedAt: new Date().toLocaleTimeString()
          }))
        );
      })
    ).subscribe(result => {
      this.mergeMapResults.push(result);
      this.addLog('mergeMap', `⚡ Kết quả cho ${result.id} (${result.name}) về đích sau ${result.latency}ms!`, 'success');
      if (this.mergeMapResults.length === 4) {
        this.mergeMapIsRunning = false;
        this.addLog('mergeMap', 'Đã hoàn thành toàn bộ 4 requests đồng thời!', 'success');
      }
    });
  }

  // ------------------------------------------
  // DEMO 6 Logic: debounceTime vs throttleTime
  // ------------------------------------------
  private setupDemo6ThrottleDebounce(): void {
    // 1. Raw click counter
    this.clickStream$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.rawClickCount++;
    });

    // 2. debounceTime stream
    this.clickStream$.pipe(
      takeUntil(this.destroy$),
      debounceTime(600)
    ).subscribe(() => {
      this.debouncedClickCount++;
      this.lastDebouncedTime = new Date().toLocaleTimeString();
      this.addLog('debounceTime(600ms)', `Tín hiệu phát ra sau khi DỪNG click 600ms! (Tổng: ${this.debouncedClickCount})`, 'warning');
    });

    // 3. throttleTime stream
    this.clickStream$.pipe(
      takeUntil(this.destroy$),
      throttleTime(600)
    ).subscribe(() => {
      this.throttledClickCount++;
      this.lastThrottledTime = new Date().toLocaleTimeString();
      this.addLog('throttleTime(600ms)', `Tín hiệu phát ra NGAY LẬP TỨC! Khóa click tiếp theo trong 600ms. (Tổng: ${this.throttledClickCount})`, 'success');
    });
  }

  onUserClickSpam(): void {
    this.clickStream$.next(Date.now());
  }

  resetClickCounters(): void {
    this.rawClickCount = 0;
    this.debouncedClickCount = 0;
    this.throttledClickCount = 0;
    this.lastDebouncedTime = '-';
    this.lastThrottledTime = '-';
    this.addLog('Demo 6', 'Đã reset bộ đếm click', 'info');
  }

  // ------------------------------------------
  // DEMO 7 Logic: Subscription & takeUntil
  // ------------------------------------------
  toggleChildComponent(): void {
    this.isChildMounted = !this.isChildMounted;
    const status = this.isChildMounted ? 'MOUNTED (Đã bật)' : 'UNMOUNTED (Đã gỡ)';
    this.addLog('Subscription Demo', `Component con: ${status}`, this.isChildMounted ? 'info' : 'warning');
  }

  // Helper log function passed to child component
  logFromChild = (msg: string, type: LogItem['type']): void => {
    this.addLog('Child Component Stream', msg, type);
  };

  // Shared Console Log helper
  addLog(source: string, value: string, type: LogItem['type']): void {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.unshift({ timestamp, source, value, type });
    if (this.logs.length > 25) {
      this.logs.pop();
    }
  }

  clearLogs(): void {
    this.logs = [];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
