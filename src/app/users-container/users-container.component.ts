import { ListCriteria } from "./../users.service";
import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import {
  ContainerState,
  FilterTypeEnum,
  pageChnageModel,
  sortChangeModel,
  User,
  UsersStoreService,
} from "./users-store.service";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-users-container",
  templateUrl: "./users-container.component.html",
  styleUrls: ["./users-container.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UsersStoreService],
})
export class UsersContainerComponent implements OnInit {
  public vm$: Observable<ContainerState>;
  public criteria$: Observable<ListCriteria>;
  public error$: Observable<any>;

  public unsubscribe = new Subject();

  constructor(
    private $store: UsersStoreService,
    private snackBar: MatSnackBar
  ) {
    this.vm$ = this.$store.userState$;
    this.criteria$ = this.$store.criteria$;
    this.error$ = this.$store.error$.pipe(filter((e) => !!e));
  }

  ngOnInit(): void {
    this.$store.getUsersList(this.criteria$);
    this.error$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((e) =>
        this.snackBar.open(e.message, "Close", { duration: 3000 })
      );
  }

  ngOnDestroy(): void {
    this.unsubscribe.next("destroy");
  }

  public onSelectAll(checked: boolean) {
    this.$store.updateSelectAll(checked);
  }

  public onSearch(keyword: string) {
    this.$store.onSearch(keyword);
  }

  public onSelectUsers(seletedUsers: User[]) {
    this.$store.patchState({ seletedUsers });
  }

  public onClear() {
    this.$store.patchState({
      selectAll: { checked: false },
      seletedUsers: [],
    });
  }

  public onFilter() {
    this.$store.onFilter();
  }

  public onUnfilter() {
    this.$store.onUnfilter();
  }

  public onSortChange(condition: sortChangeModel) {
    this.$store.onSortChange(condition);
  }

  public onPageChange(page: number) {
    this.$store.onPageChange(page);
  }
}
