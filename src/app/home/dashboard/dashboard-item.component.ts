import { ChangeDetectionStrategy, Component, Injector, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { DashboardItemConfig } from 'app/content/dashboard-item-config';
import { DashboardItemType } from 'app/content/dashbord-item-type';
import { BaseComponent } from 'app/shared/base.component';
import { BehaviorSubject } from 'rxjs';

/**
 * An item in the dashboard
 */
@Component({
  selector: 'dashboard-item',
  templateUrl: 'dashboard-item.component.html',
  styleUrls: ['dashboard-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardItemComponent extends BaseComponent implements OnInit {
  DashboardItemType = DashboardItemType;

  @Input() config: DashboardItemConfig;
  @Output() ready = new EventEmitter<boolean>(true);

  data: any;
  ready$ = new BehaviorSubject(false);

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit() {
    this.data = this.config.data || {};
  }

  notifyReady(event: boolean) {
    if (event !== false) {
      this.ready$.next(true);
      this.ready.emit(true);
    }
  }

}
