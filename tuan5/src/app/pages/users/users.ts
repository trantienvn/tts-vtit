import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { User, UserForm } from '../../models/user.model';
import { UserModalComponent } from '../../components/user-modal/user-modal';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, UserModalComponent],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class UsersComponent implements OnInit {
  users       = signal<User[]>([]);
  loading     = signal(true);
  actionLoad  = signal(false);
  toast       = signal<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Pagination
  currentPage = signal(1);
  totalPages  = signal(1);
  totalUsers  = signal(0);

  // Modal
  showModal   = signal(false);
  editingUser = signal<User | null>(null);

  // Delete
  showDeleteConfirm = signal(false);
  deletingUser      = signal<User | null>(null);

  currentUser = computed(() => this.auth.getUser());

  constructor(
    private auth: AuthService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.loadUsers(1);
  }

  loadUsers(page: number): void {
    this.loading.set(true);
    this.currentPage.set(page);

    this.api.getUsers(page, 6).subscribe({
      next: res => {
        this.loading.set(false);
        this.users.set(res.data || []);
        this.totalPages.set(res.total_pages || 1);
        this.totalUsers.set(res.total || res.data?.length || 0);
      },
      error: err => {
        this.loading.set(false);
        this.showToast('Lỗi khi tải danh sách người dùng: ' + (err.message || 'Không kết nối được API'), 'error');
      }
    });
  }

  pagesArray(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      pages.push(i);
    }
    return pages;
  }

  openAdd(): void {
    this.editingUser.set(null);
    this.showModal.set(true);
  }

  openEdit(user: User): void {
    this.editingUser.set(user);
    this.showModal.set(true);
  }

  onModalSave(form: UserForm): void {
    this.actionLoad.set(true);
    const editing = this.editingUser();

    if (editing) {
      this.api.updateUser(editing.id, form).subscribe({
        next: updated => {
          this.actionLoad.set(false);
          this.showModal.set(false);
          this.showToast('Cập nhật người dùng thành công!', 'success');
          this.loadUsers(this.currentPage());
        },
        error: err => {
          this.actionLoad.set(false);
          this.showToast('Lỗi khi cập nhật: ' + (err.error?.error || err.message), 'error');
        }
      });
    } else {
      this.api.createUser(form).subscribe({
        next: created => {
          this.actionLoad.set(false);
          this.showModal.set(false);
          this.showToast('Thêm người dùng thành công!', 'success');
          this.loadUsers(this.currentPage());
        },
        error: err => {
          this.actionLoad.set(false);
          this.showToast('Lỗi khi thêm mới: ' + (err.error?.error || err.message), 'error');
        }
      });
    }
  }

  onModalCancel(): void {
    this.showModal.set(false);
  }

  openDelete(user: User): void {
    this.deletingUser.set(user);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    const user = this.deletingUser();
    if (!user) return;

    this.actionLoad.set(true);
    this.api.deleteUser(user.id).subscribe({
      next: () => {
        this.actionLoad.set(false);
        this.showDeleteConfirm.set(false);
        this.deletingUser.set(null);
        this.showToast('Xóa người dùng thành công!', 'success');
        this.loadUsers(this.currentPage());
      },
      error: err => {
        this.actionLoad.set(false);
        this.showToast('Lỗi khi xóa người dùng: ' + (err.error?.error || err.message), 'error');
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.deletingUser.set(null);
  }

  logout(): void { this.auth.logout(); }

  getInitial(user: User): string {
    return (user.first_name || '?')[0].toUpperCase();
  }

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 3000);
  }
}
