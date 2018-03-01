import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { of as observableOf } from 'rxjs/observable/of';
import { Subscription } from 'rxjs/Subscription';

/**
 * Base class to be extended by resolvers that fetch data once and the data is
 * cached for all next executions
 */
export abstract class SingletonResolve<T> implements Resolve<T> {
  _data = new BehaviorSubject<T>(null);
  _requested = false;
  _done = false;

  get data(): BehaviorSubject<T> {
    if (!this._requested) {
      this._requested = true;
      this.fetch()
        .subscribe(data => {
          // On success, store the data and mark as done
          this._done = true;
          this._data.next(data);
        }, err => {
          // On error, clear the requested flag, so it could eventually retry
          this._requested = false;
        });
    }
    return this._data;
  }

  protected abstract fetch(): Observable<T>;

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<T> {
    if (this._data.value !== null) {
      // Already resolved
      return observableOf(this._data.value);
    }
    // Return an observable
    let subscription: Subscription = null;
    return Observable.create(observer => {
      subscription = this.data.subscribe(data => {
        // Ensure we're not getting the initial null data
        if (this._done) {
          observer.next(data);
          observer.complete();
          subscription.unsubscribe();
        }
      });
    });
  }
}
