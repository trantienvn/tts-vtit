import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subject, Observable, of, from, forkJoin, combineLatest, throwError, timer, interval } from 'rxjs';
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
  delay,
  retry,
  catchError,
  finalize,
  startWith
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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

import { StudentService } from '../../core/services/student.service';
import { Student, SchoolClass } from '../../core/models/student.model';
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
    NzSelectModule,
    NzCheckboxModule,
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

  // ==========================================
  // DEMO 8: forkJoin vs combineLatest
  // ==========================================
  forkJoinLogs: string[] = [];
  combineLatestLogs: string[] = [];
  forkJoinIsRunning = false;
  combineLatestIsRunning = false;
  simulateApiError = false;

  // ==========================================
  // DEMO 9: Error Handling (retry, catchError, finalize)
  // ==========================================
  errorDemoLogs: string[] = [];
  errorDemoIsLoading = false;
  errorTypeSelected: '500' | 'timeout' | '200' = '500';
  retryCountSelected = 2;

  // ==========================================
  // DEMO 10: Flow Demo Tổng hợp
  // ==========================================
  flowSearchControl = new FormControl('', { nonNullable: true });
  flowClassControl = new FormControl('ALL', { nonNullable: true });
  flowStatusControl = new FormControl('ALL', { nonNullable: true });
  flowSimulateError = false;
  flowIsLoading = false;
  flowResults: Student[] = [];
  flowLogs: string[] = [];
  flowClasses: SchoolClass[] = [];

  ngOnInit(): void {
    this.studentService.getStudents().pipe(takeUntil(this.destroy$)).subscribe(list => {
      this.rawStudentsList = list;
      this.runBasicOperatorPipeline();
    });

    this.setupDemo2ReactiveSearch();
    this.setupDemo3SwitchMap();
    this.setupDemo4ConcatMap();
    this.setupDemo6ThrottleDebounce();
    this.setupDemo10Flow();
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

  // ==========================================
  // DEMO 8: forkJoin vs combineLatest
  // ==========================================
  triggerForkJoin(): void {
    this.forkJoinLogs = [];
    this.forkJoinIsRunning = true;
    this.addLog('forkJoin', 'Khởi chạy forkJoin (đợi tất cả hoàn thành)...', 'info');

    const callA$ = of('Dữ liệu lớp CNTT (delay 600ms)').pipe(
      delay(600),
      tap(() => this.forkJoinLogs.push('⏱️ Call A hoàn thành sau 600ms'))
    );
    
    const callB$ = this.simulateApiError 
      ? throwError(() => new Error('Simulated HTTP 500 Error')).pipe(
          delay(1000),
          tap({ error: () => this.forkJoinLogs.push('❌ Call B gặp lỗi sau 1000ms') })
        )
      : of('Dữ liệu thống kê (delay 1200ms)').pipe(
          delay(1200),
          tap(() => this.forkJoinLogs.push('⏱️ Call B hoàn thành sau 1200ms'))
        );

    const callC$ = of('Dữ liệu cấu hình (delay 1800ms)').pipe(
      delay(1800),
      tap(() => this.forkJoinLogs.push('⏱️ Call C hoàn thành sau 1800ms'))
    );

    forkJoin({ a: callA$, b: callB$, c: callC$ }).pipe(
      catchError(err => {
        this.forkJoinLogs.push(`💥 forkJoin THẤT BẠI HOÀN TOÀN vì có 1 stream lỗi: ${err.message}`);
        this.addLog('forkJoin', 'Thất bại do lỗi!', 'error');
        return of(null);
      }),
      finalize(() => {
        this.forkJoinIsRunning = false;
      })
    ).subscribe(res => {
      if (res) {
        this.forkJoinLogs.push(`✅ forkJoin thành công! Nhận kết quả gộp: ${JSON.stringify(res)}`);
        this.addLog('forkJoin', 'Hoàn thành thành công', 'success');
      }
    });
  }

  triggerCombineLatest(): void {
    this.combineLatestLogs = [];
    this.combineLatestIsRunning = true;
    this.addLog('combineLatest', 'Khởi chạy combineLatest...', 'info');

    const streamA$ = interval(1000).pipe(
      take(3),
      map(v => `Lọc từ khóa #${v}`),
      tap(v => this.combineLatestLogs.push(`🔄 Stream A phát: "${v}"`))
    );

    const streamB$ = interval(1500).pipe(
      take(2),
      map(v => `Lọc lớp #${v}`),
      tap(v => this.combineLatestLogs.push(`🔄 Stream B phát: "${v}"`))
    );

    combineLatest([streamA$, streamB$]).pipe(
      finalize(() => {
        this.combineLatestIsRunning = false;
        this.addLog('combineLatest', 'Stream kết thúc', 'info');
      })
    ).subscribe({
      next: ([a, b]) => {
        this.combineLatestLogs.push(`👉 Gộp mới nhất: [${a}, ${b}]`);
        this.addLog('combineLatest', `Phát: [${a}, ${b}]`, 'success');
      }
    });
  }

  // ==========================================
  // DEMO 9: Error Handling (retry, catchError, finalize)
  // ==========================================
  runErrorDemo(): void {
    this.errorDemoLogs = [];
    this.errorDemoIsLoading = true;
    this.errorDemoLogs.push('🚀 Khởi tạo HTTP Request với mô phỏng lỗi...');
    this.addLog('Error Demo', 'Khởi động HTTP Request', 'info');

    const isTimeout = this.errorTypeSelected === 'timeout';
    const errorCode = this.errorTypeSelected === '500' ? '500' : undefined;

    let attemptCount = 0;

    this.studentService.getStudentsWithErrorSimulation(errorCode, isTimeout).pipe(
      tap(() => {
        attemptCount++;
        this.errorDemoLogs.push(`📥 Thử nghiệm lần ${attemptCount}: Gửi request thành công!`);
      }),
      retry(this.retryCountSelected),
      catchError(err => {
        this.errorDemoLogs.push(`❌ Lỗi bắt được ở catchError: ${err.message || 'Mất kết nối'}`);
        this.errorDemoLogs.push('🩺 Trả về danh sách sinh viên rỗng để hồi phục stream!');
        this.addLog('Error Demo', 'Bắt được lỗi & Hồi phục', 'warning');
        return of([]); // recover with empty array
      }),
      finalize(() => {
        this.errorDemoIsLoading = false;
        this.errorDemoLogs.push('🏁 finalize() đã chạy: Đã tắt Loading Spinner thành công.');
        this.addLog('Error Demo', 'Request finalize() kết thúc', 'info');
      })
    ).subscribe(list => {
      this.errorDemoLogs.push(`🎉 Subscriber nhận được danh sách gồm ${list.length} sinh viên.`);
      if (list.length > 0) {
        this.addLog('Error Demo', 'Thành công!', 'success');
      }
    });
  }

  // ==========================================
  // DEMO 10: Flow Demo Tổng hợp
  // ==========================================
  setupDemo10Flow(): void {
    this.studentService.getClasses().subscribe(res => this.flowClasses = res);

    const search$ = this.flowSearchControl.valueChanges.pipe(
      startWith(this.flowSearchControl.value),
      tap(val => this.addFlowLog(`[valueChanges] Thay đổi từ khóa: "${val}"`)),
      debounceTime(400),
      tap(val => this.addFlowLog(`[debounceTime] Đã dừng gõ 400ms: "${val}"`)),
      distinctUntilChanged(),
      tap(val => this.addFlowLog(`[distinctUntilChanged] Từ khóa thay đổi: "${val}"`)),
      filter(term => {
        const trimmed = term.trim();
        const isValid = trimmed.length === 0 || trimmed.length >= 2;
        if (!isValid) {
          this.addFlowLog(`[filter] BỊ CHẶN: Từ khóa ngắn hơn 2 ký tự (chờ tiếp...)`);
        }
        return isValid;
      })
    );

    const class$ = this.flowClassControl.valueChanges.pipe(
      startWith(this.flowClassControl.value),
      tap(val => this.addFlowLog(`[class filter] Chọn lớp: "${val}"`)),
      distinctUntilChanged()
    );

    const status$ = this.flowStatusControl.valueChanges.pipe(
      startWith(this.flowStatusControl.value),
      tap(val => this.addFlowLog(`[status filter] Chọn trạng thái: "${val}"`)),
      distinctUntilChanged()
    );

    combineLatest([search$, class$, status$]).pipe(
      takeUntil(this.destroy$),
      tap(([q, c, s]) => {
        this.addFlowLog(`[combineLatest] Gộp các bộ lọc: [Từ khóa: "${q}", Lớp: "${c}", Trạng thái: "${s}"]`);
        this.flowIsLoading = true;
      }),
      switchMap(([q, c, s]) => {
        this.addFlowLog(`[switchMap] Hủy request cũ (nếu có) và gửi HTTP request mới...`);
        const errParam = this.flowSimulateError ? '500' : undefined;
        return this.studentService.getStudentsWithErrorSimulation(errParam, false).pipe(
          map(list => {
            let filtered = list;
            if (c !== 'ALL') filtered = filtered.filter(item => item.className === c);
            if (s !== 'ALL') filtered = filtered.filter(item => item.status === s);
            if (q) {
              const query = q.toLowerCase();
              filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(query) || 
                item.id.toLowerCase().includes(query)
              );
            }
            return filtered;
          }),
          retry(2),
          catchError(err => {
            this.addFlowLog(`[catchError] Lỗi API: ${err.message || 'Mất kết nối'}. Trả về [] để hồi phục.`);
            return of([]);
          }),
          finalize(() => {
            this.addFlowLog(`[finalize] Tắt trạng thái Loading.`);
            this.flowIsLoading = false;
          })
        );
      })
    ).subscribe(results => {
      this.flowResults = results;
      this.addFlowLog(`[subscribe] Nhận kết quả! Tìm thấy ${results.length} sinh viên.`);
      this.addLog('Flow Tổng hợp', `Tìm thấy ${results.length} kết quả`, 'success');
    });
  }

  addFlowLog(msg: string): void {
    const time = new Date().toLocaleTimeString();
    this.flowLogs.unshift(`[${time}] ${msg}`);
    if (this.flowLogs.length > 25) {
      this.flowLogs.pop();
    }
  }

  clearFlowLogs(): void {
    this.flowLogs = [];
  }

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
