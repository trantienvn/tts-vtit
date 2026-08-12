import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, BehaviorSubject, Subscription, interval, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';

interface StreamLog {
  timestamp: string;
  source: string;
  value: any;
  type: 'info' | 'success' | 'warning' | 'error';
}

@Component({
  selector: 'app-rxjs-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzCardModule,
    NzTagModule
  ],
  templateUrl: './rxjs-demo.component.html',
  styleUrl: './rxjs-demo.component.scss'
})
export class RxjsDemoComponent implements OnInit, OnDestroy {
  // 1. BehaviorSubject Stream
  counter$ = new BehaviorSubject<number>(0);

  // 2. Subject Stream with debounceTime & distinctUntilChanged
  searchSubject$ = new Subject<string>();
  
  // States
  searchValue = '';
  debouncedSearchValue = '';
  isTimerRunning = false;
  
  logs: StreamLog[] = [];

  private subscriptions: Subscription[] = [];
  private timerSub?: Subscription;

  ngOnInit(): void {
    // Custom Observable Demo
    this.runBasicObservableDemo();

    // Debounce search stream setup
    const searchSub = this.searchSubject$.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(val => {
      this.debouncedSearchValue = val;
      this.addLog('Search Input Stream (debounceTime 400ms)', val, 'info');
    });
    this.subscriptions.push(searchSub);

    // Counter stream listener
    const countSub = this.counter$.subscribe(val => {
      this.addLog('BehaviorSubject Counter Stream', val, 'success');
    });
    this.subscriptions.push(countSub);
  }

  private runBasicObservableDemo(): void {
    const basic$ = new Observable<number>(observer => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
    });

    const sub = basic$.subscribe({
      next: (val) => this.addLog('Basic Observable', `next(${val})`, 'info'),
      complete: () => this.addLog('Basic Observable', 'complete()', 'success')
    });
    this.subscriptions.push(sub);
  }

  onSearchInput(val: string): void {
    this.searchSubject$.next(val);
  }

  increment(): void {
    this.counter$.next(this.counter$.value + 1);
  }

  decrement(): void {
    this.counter$.next(this.counter$.value - 1);
  }

  resetCounter(): void {
    this.counter$.next(0);
  }

  toggleAutoTimer(): void {
    if (this.isTimerRunning) {
      this.timerSub?.unsubscribe();
      this.isTimerRunning = false;
      this.addLog('Auto Timer Stream', 'Unsubscribed from interval stream', 'warning');
    } else {
      this.isTimerRunning = true;
      this.timerSub = interval(1000).pipe(
        map(val => val + 1)
      ).subscribe(val => {
        this.counter$.next(val);
      });
      this.subscriptions.push(this.timerSub);
      this.addLog('Auto Timer Stream', 'Subscribed to interval(1000ms) stream', 'info');
    }
  }

  clearLogs(): void {
    this.logs = [];
  }

  private addLog(source: string, value: any, type: StreamLog['type']): void {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.unshift({ timestamp, source, value, type });
    if (this.logs.length > 20) {
      this.logs.pop();
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe all active subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
