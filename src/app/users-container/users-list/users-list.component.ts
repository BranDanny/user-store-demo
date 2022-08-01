import { User } from "./../users-store.service";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";

@Component({
  selector: "app-users-list",
  templateUrl: "./users-list.component.html",
  styleUrls: ["./users-list.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent implements OnInit {
  @ViewChild("usersList") usersList: any;

  @Input() users: User[] = [];
  @Input() isLoading: boolean = false;
  @Input() set selectAll(isSelectAll: { checked: boolean }) {
    if (!this.usersList) return;
    if (isSelectAll.checked) {
      this.usersList.selectAll();
      this.emitSelectedUsers.emit(this.users);
    } else {
      this.usersList.deselectAll();
      this.emitSelectedUsers.emit([]);
    }
  }

  @Output() emitSelectedUsers = new EventEmitter<User[]>();

  constructor() {}

  ngOnInit(): void {}

  public onSelectionChange() {
    const selectedUsers = this.usersList.selectedOptions.selected.map(
      (s: any) => s.value
    );

    this.emitSelectedUsers.emit(selectedUsers);
  }
}
