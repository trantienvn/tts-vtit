import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User, UserForm } from '../../models/user.model';
import { UserModalComponent } from '../../components/user-modal/user-modal';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, UserModalComponent],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class UsersComponent {
  users   = computed(() => this.userService.users());
  toast   = signal<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Modal state
  showModal   = signal(false);
  editingUser = signal<User | null>(null);

  // Delete state
  showDeleteConfirm = signal(false);
  deletingUser      = signal<User | null>(null);

  currentUser = computed(() => this.auth.getUser());

  constructor(
    private auth: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  get userCount() { return this.userService.users().length; }

  openAdd(): void {
    this.editingUser.set(null);
    this.showModal.set(true);
  }

  openEdit(user: User): void {
    this.editingUser.set(user);
    this.showModal.set(true);
  }

  onModalSave(form: UserForm): void {
    const editing = this.editingUser();
    if (editing) {
      this.userService.update(editing.id, form);
      this.showToast('Cập nhật người dùng thành công!', 'success');
    } else {
      this.userService.add(form);
      this.showToast('Thêm người dùng thành công!', 'success');
    }
    this.showModal.set(false);
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
    if (user) {
      this.userService.delete(user.id);
      this.showToast('Xóa người dùng thành công!', 'success');
    }
    this.showDeleteConfirm.set(false);
    this.deletingUser.set(null);
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
