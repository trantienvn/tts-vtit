import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

interface Customer { id: number; name: string; email: string; company: string; status: 'Hoạt động' | 'Chờ xử lý' | 'Tạm dừng'; }
const DATA: Customer[] = [
  { id: 1, name: 'Nguyễn Minh Anh', email: 'minhanh@viettel.vn', company: 'Viettel Digital', status: 'Hoạt động' },
  { id: 2, name: 'Trần Quốc Bảo', email: 'quocbao@viettel.vn', company: 'Viettel Solutions', status: 'Chờ xử lý' },
  { id: 3, name: 'Lê Thu Hà', email: 'thuha@viettel.vn', company: 'Viettel Digital', status: 'Hoạt động' },
  { id: 4, name: 'Phạm Đức Long', email: 'duclong@viettel.vn', company: 'Viettel Cloud', status: 'Tạm dừng' },
  { id: 5, name: 'Đỗ Khánh Linh', email: 'khanhlinh@viettel.vn', company: 'Viettel Solutions', status: 'Hoạt động' },
  { id: 6, name: 'Vũ Thành Nam', email: 'thanhnam@viettel.vn', company: 'Viettel Cloud', status: 'Chờ xử lý' },
  { id: 7, name: 'Bùi Hoàng Yến', email: 'hoangyen@viettel.vn', company: 'Viettel Digital', status: 'Hoạt động' },
  { id: 8, name: 'Hoàng Anh Tuấn', email: 'anhtuan@viettel.vn', company: 'Viettel Solutions', status: 'Tạm dừng' },
];

@Component({
  selector: 'app-root', standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzAlertModule, NzButtonModule, NzCardModule, NzInputModule, NzPaginationModule, NzSelectModule, NzTableModule, NzTagModule],
  templateUrl: './app.html', styleUrl: './app.css'
})
export class App {
  private readonly destroyRef = inject(DestroyRef);
  private readonly refresh$ = new BehaviorSubject(0);
  readonly search = new FormControl('', { nonNullable: true });
  readonly status = new FormControl('Tất cả', { nonNullable: true });
  readonly customers$ = combineLatest([
    this.search.valueChanges.pipe(startWith(''), debounceTime(250), distinctUntilChanged()),
    this.status.valueChanges.pipe(startWith('Tất cả'), distinctUntilChanged()),
    this.refresh$
  ]).pipe(
    switchMap(([term, status]) => of(DATA).pipe(
      map(rows => rows.filter(row => `${row.name} ${row.email} ${row.company}`.toLocaleLowerCase('vi').includes(term.trim().toLocaleLowerCase('vi')))
        .filter(row => status === 'Tất cả' || row.status === status)),
      catchError(() => of([] as Customer[]))
    )),
    takeUntilDestroyed(this.destroyRef)
  );
  readonly summary$ = this.refresh$.pipe(map(() => ({ total: DATA.length, active: DATA.filter(x => x.status === 'Hoạt động').length, waiting: DATA.filter(x => x.status === 'Chờ xử lý').length })), takeUntilDestroyed(this.destroyRef));
  reload(): void { this.refresh$.next(this.refresh$.value + 1); }
}
