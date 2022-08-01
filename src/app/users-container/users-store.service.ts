import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { EMPTY, Observable } from "rxjs";
import { catchError, switchMap, tap } from "rxjs/operators";
import { UsersService } from "../users.service";
import { ListCriteria } from "./../users.service";

export enum FilterTypeEnum {
  None,
  Search,
  Selection,
}

export interface sortChangeModel {
  active: string;
  direction: string;
}

export interface pageChnageModel {
  pageIndex: number;
  pageSize: number;
}

export interface User {
  name: string;
  surname: string;
  email: string;
}

export interface UserState {
  isLoading: boolean;
  users: User[];
  seletedUsers: User[];
  selectAll: { checked: boolean };
  filterType: FilterTypeEnum;
  count: number;
  error: any;
  criteria: ListCriteria;
}

export interface ContainerState {
  seletedUsers: User[];
  selectAll: { checked: boolean };
  clearDisabled: boolean;
  deleteDisabled: boolean;
  filterDisabled: boolean;
  unfilterDisabled: boolean;
  users: User[];
  isSelectAll: boolean;
  canSelectAll: boolean;
  isLoading: boolean;
  keyword: string;
  count: number;
}

export const initialState = {
  users: [],
  seletedUsers: [],
  selectAll: { checked: false },
  filterType: FilterTypeEnum.None,
  isLoading: false,
  count: 0,
  criteria: {
    search: "",
    limit: 10,
    page: 1,
    sortBy: "name",
    order: "asc",
  },
  error: null,
};

@Injectable()
export class UsersStoreService extends ComponentStore<UserState> {
  constructor(private $http: UsersService) {
    super(initialState);
  }

  // state selectors
  public users$ = this.select((state) => state.users);

  public seletedUsers$ = this.select((state) => state.seletedUsers);

  public selectAll$ = this.select((state) => state.selectAll);

  public keyword$ = this.select((state) => state.criteria.search);

  public filterType$ = this.select((state) => state.filterType);

  public isLoading$ = this.select((state) => state.isLoading);

  public count$ = this.select((state) => state.count);

  public error$ = this.select((state) => state.error);

  public criteria$ = this.select((state) => state.criteria);

  // combining selectors
  public deleteDisabled$ = this.select(
    this.seletedUsers$,
    (seletedUsers) => !!seletedUsers && !seletedUsers.length
  );

  public filteredUsers$ = this.select(
    this.filterType$,
    this.users$,
    this.seletedUsers$,
    (filterType, users, seletedUsers) => {
      switch (filterType) {
        case FilterTypeEnum.Search:
          return users;

        case FilterTypeEnum.Selection:
          return seletedUsers;

        default:
          return users;
      }
    }
  );

  public isSelectAll$ = this.select(
    this.filteredUsers$,
    this.seletedUsers$,
    (filteredUsers, seletedUsers) =>
      !!filteredUsers.length && filteredUsers.length === seletedUsers.length
  );

  public clearDisabled$ = this.select(
    this.seletedUsers$,
    this.isSelectAll$,
    (seletedUsers, isSelectAll) => !seletedUsers.length || isSelectAll
  );

  public canSelectAll$ = this.select(
    this.filteredUsers$,
    (filteredUsers) => !!filteredUsers.length
  );

  public filterDisabled$ = this.select(
    this.seletedUsers$,
    (selectUsers) => !selectUsers.length
  );

  public unfilterDisabled$ = this.select(
    this.filterType$,
    (filterType) => filterType === FilterTypeEnum.None
  );

  public userState$ = this.select(
    this.seletedUsers$,
    this.selectAll$,
    this.clearDisabled$,
    this.deleteDisabled$,
    this.users$,
    this.isSelectAll$,
    this.canSelectAll$,
    this.filterDisabled$,
    this.unfilterDisabled$,
    this.keyword$,
    this.isLoading$,
    this.count$,
    (
      seletedUsers,
      selectAll,
      clearDisabled,
      deleteDisabled,
      users,
      isSelectAll,
      canSelectAll,
      filterDisabled,
      unfilterDisabled,
      keyword,
      isLoading,
      count
    ) => ({
      seletedUsers,
      selectAll,
      clearDisabled,
      deleteDisabled,
      users,
      isSelectAll,
      canSelectAll,
      filterDisabled,
      unfilterDisabled,
      keyword,
      isLoading,
      count,
    })
  );

  public updateSelectAll(checked: boolean) {
    const currentFilterType = this.get((state) => state.filterType);
    const filterType =
      currentFilterType === FilterTypeEnum.Selection
        ? FilterTypeEnum.None
        : currentFilterType;

    this.patchState({
      selectAll: { checked },
      filterType,
    });
  }

  readonly getUsersList = this.effect((criteria$: Observable<ListCriteria>) => {
    return criteria$.pipe(
      tap(() => {
        this.patchState({
          isLoading: true,
        });
      }),
      switchMap((criteria) => this.$http.list(criteria)),
      tap({
        next: (response: any) => {
          this.patchState({
            isLoading: false,
            users: response["results"],
            count: response["count"],
          });
        },
        error: (error) => {
          this.patchState({
            isLoading: false,
            error,
          });
        },
      }),
      catchError(() => EMPTY)
    );
  });

  public onFilter() {
    const criteria = { ...this.get((state) => state.criteria), search: "" };
    this.patchState({
      criteria,
      filterType: FilterTypeEnum.Selection,
    });
  }

  public onUnfilter() {
    const criteria = { ...this.get((state) => state.criteria), search: "" };
    this.patchState({
      criteria,
      filterType: FilterTypeEnum.None,
    });
  }

  public onSearch(search: string) {
    const criteria = {
      ...this.get((state) => state.criteria),
      search,
      page: 1,
    };
    this.patchState({
      criteria,
      filterType: FilterTypeEnum.Search,
    });
  }

  public onSortChange(condition: sortChangeModel) {
    const criteria = {
      ...this.get((state) => state.criteria),
      sortBy: condition.active,
      order: condition.direction,
    };

    this.patchState({
      criteria,
    });
  }

  public onPageChange(page: number) {
    const criteria = {
      ...this.get((state) => state.criteria),
      page,
    };

    this.patchState({
      criteria,
    });
  }
}
