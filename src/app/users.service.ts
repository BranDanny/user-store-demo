import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, delay, Observable, throwError } from "rxjs";
import { User } from "./users-container/users-store.service";

export interface ListCriteria {
  sortBy: string;
  order?: string;
  search: string;
  limit: number;
  page: number;
}

@Injectable({
  providedIn: "root",
})
export class UsersService {
  readonly apiUrl = "https://62e6716269bd03090f709750.mockapi.io/api/users";

  constructor(private $http: HttpClient) {}

  public list(criteria?: ListCriteria): Observable<User[]> {
    if (!criteria)
      criteria = {
        search: "",
        limit: 10,
        page: 1,
        sortBy: "name",
        order: "asc",
      };
    const order = criteria?.order ? criteria?.order : "asc";
    criteria = { ...criteria, order } as any;

    return (
      this.$http
        .get<User[]>(this.apiUrl, { params: <any>criteria })
        // .get<User[]>(this.apiUrl + "sfsdf", { params: <any>criteria })
        .pipe(delay(500), catchError(this.handleError))
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error("Error Occurred: ", error.error);
    } else {
      console.error(`Backend Returned Code ${error.status}`);
    }

    return throwError(() => new Error("Something Wrong!"));
  }
}
