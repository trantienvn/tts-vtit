import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Subscription, interval, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzBadgeModule } from 'ng-zorro-antd/badge';

@Component({
  selector: 'app-sub-cleanup-demo',
  standalone: true,
  imports: [CommonModule, NzAlertModule, NzTagModule, NzBadgeModule],
  template: `
    <div class="sub-demo-box" style="padding: 16px; border: 1px dashed #1890ff; background: #e6f7ff; border-radius: 8px; margin-top: 12px;">
      <h4>
        <nz-badge status="processing"></nz-badge>
        Component con đang hoạt động (Strategy: <strong>{{ strategy }}</strong>)
      </h4>
      <p style="margin-bottom: 8px; color: #555;">
        Stream Interval phát mỗi 1 giây. Giá trị hiện tại:
        <nz-tag [nzColor]="strategy === 'leak' ? 'error' : 'success'">
          Ticks: {{ tickValue }}
        </nz-tag>
      </p>

      <ng-container *ngIf="strategy === 'asyncPipe'">
        <p style="color: #096dd9; font-weight: 500;">
          Dữ liệu từ AsyncPipe: <strong>{{ asyncCounter$ | async }}</strong>
        </p>
      </ng-container>

      <nz-alert
        [nzType]="strategy === 'leak' ? 'warning' : 'info'"
        [nzMessage]="strategy === 'leak'
          ? 'CẢNH BÁO: Khi gỡ Component này, nếu chọn Unhandled Subscription, interval sẽ vẫn tiếp tục chạy ẩn trong bộ nhớ (Memory Leak)!'
          : 'AN TOÀN: Khi gỡ Component này, destroy$.next() sẽ tự động hủy Subscription!'"
        nzShowIcon>
      </nz-alert>
    </div>
  `
})
export class SubCleanupDemoComponent implements OnInit, OnDestroy {
  @Input() strategy: 'leak' | 'takeUntil' | 'asyncPipe' = 'takeUntil';
  @Input() onLog!: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void;

  tickValue = 0;
  asyncCounter$: Observable<number> = interval(1000);
  private destroy$ = new Subject<void>();
  private manualSub?: Subscription;

  ngOnInit(): void {
    if (this.strategy === 'leak') {
      // Unhandled subscription (Memory Leak demo)
      this.manualSub = interval(1000).subscribe(val => {
        this.tickValue = val;
        if (this.onLog) {
          this.onLog(`[LEAK COMPONENT] Interval tick #${val} (Thủ công - Không cleanup!)`, 'error');
        }
      });
    } else if (this.strategy === 'takeUntil') {
      // Safe subscription with takeUntil(destroy$)
      interval(1000)
        .pipe(takeUntil(this.destroy$))
        .subscribe(val => {
          this.tickValue = val;
          if (this.onLog) {
            this.onLog(`[takeUntil COMPONENT] Interval tick #${val} (Tự động cleanup qua destroy$)`, 'success');
          }
        });
    } else if (this.strategy === 'asyncPipe') {
      if (this.onLog) {
        this.onLog(`[AsyncPipe COMPONENT] Khoản subscribe được quản lý tự động bởi Angular Template!`, 'info');
      }
    }
  }

  ngOnDestroy(): void {
    if (this.strategy === 'takeUntil') {
      this.destroy$.next();
      this.destroy$.complete();
      if (this.onLog) {
        this.onLog(`[takeUntil COMPONENT] ngOnDestroy() được gọi: destroy$.next() đã giải phóng Subscription!`, 'success');
      }
    } else if (this.strategy === 'leak') {
      if (this.onLog) {
        this.onLog(`[LEAK COMPONENT] ngOnDestroy() đã gọi nhưng Subscription KHÔNG bị unsubscribe! Hãy xem Console Log vẫn chạy tiếp!`, 'error');
      }
    }
  }
}
