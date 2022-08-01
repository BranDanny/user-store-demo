import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { merge, Subject } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  tap,
} from "rxjs/operators";
import { pageChnageModel, sortChangeModel } from "../users-store.service";

@Component({
  selector: "app-users-actions-panel",
  templateUrl: "./users-actions-panel.component.html",
  styleUrls: ["./users-actions-panel.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersActionsPanelComponent implements OnInit, OnDestroy {
  @Input() clearDisabled: boolean = true;
  @Input() deleteDisabled: boolean = true;
  @Input() filterDisabled: boolean = true;
  @Input() unfilterDisabled: boolean = true;
  @Input() count: number = 0;
  @Input() set isSelectAll(isSelecAll: boolean) {
    this.form.get("selectAll")?.setValue(isSelecAll, { emitEvent: false });
  }
  @Input() set keyword(keyword: string) {
    this.form.get("search")?.setValue(keyword, { emitEvent: false });
  }
  @Input() set canSelectAll(canSelectAll: boolean) {
    if (canSelectAll) {
      this.form.get("selectAll")?.enable();
    } else {
      this.form.get("selectAll")?.disable();
    }
  }

  @Output() emitSelectAll = new EventEmitter<boolean>();
  @Output() emitSearch = new EventEmitter<string>();
  @Output() emitClear = new EventEmitter<void>();
  @Output() emitFilter = new EventEmitter<void>();
  @Output() emitUnfilter = new EventEmitter<void>();
  @Output() emitSortChange = new EventEmitter<sortChangeModel>();
  @Output() emitPageChange = new EventEmitter<number>();

  public form: FormGroup = this.fb.group({
    selectAll: false,
    search: "",
  });
  public selectAllChanges = this.form.get("selectAll")?.valueChanges;
  public searchChanges = this.form.get("search")?.valueChanges;
  public unsubscribe = new Subject<void>();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.selectAllChanges
      ?.pipe(
        takeUntil(this.unsubscribe),
        tap((value: boolean) => {
          this.emitSelectAll.emit(value);
        })
      )
      .subscribe();

    this.searchChanges
      ?.pipe(
        takeUntil(this.unsubscribe),
        debounceTime(300),
        tap((value: string) => {
          this.emitSearch.emit(value);
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
  }

  public clearSelected() {
    this.emitClear.emit();
  }

  public filterSelected() {
    this.emitFilter.emit();
  }

  public unfilterSelected() {
    this.emitUnfilter.emit();
  }

  public sortChanged(condition: sortChangeModel) {
    this.emitSortChange.emit(condition);
  }

  public pageChanged(condition: pageChnageModel) {
    this.emitPageChange.emit(condition.pageIndex + 1);
  }
}
