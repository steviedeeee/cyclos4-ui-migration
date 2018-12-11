import { ChangeDetectionStrategy, Component, Injector, Input, OnInit } from '@angular/core';
import { Account, AccountBalanceHistoryResult, AccountHistoryResult, Currency, TimeFieldEnum } from 'app/api/models';
import { AccountsService } from 'app/api/services';
import { ISO_DATE } from 'app/core/format.service';
import { BaseDashboardComponent } from 'app/home/dashboard/base-dashboard.component';
import { HeadingAction } from 'app/shared/action';
import { ApiHelper } from 'app/shared/api-helper';
import { BehaviorSubject } from 'rxjs';

/**
 * Displays the status of an account.
 * Shows information such as balance, available balance, etc.
 */
@Component({
  selector: 'account-status',
  templateUrl: 'account-status.component.html',
  styleUrls: ['account-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountStatusComponent extends BaseDashboardComponent implements OnInit {

  @Input() account: Account;
  @Input() maxTransfers: number;

  history$ = new BehaviorSubject<AccountBalanceHistoryResult>(null);
  lastPayments$ = new BehaviorSubject<AccountHistoryResult[]>(null);
  title: string;
  headingActions: HeadingAction[];
  currency: Currency;
  balance: string;

  constructor(injector: Injector,
    private accountsService: AccountsService) {
    super(injector);
  }

  ngOnInit() {
    super.ngOnInit();

    const permissions = this.login.auth.permissions || {};
    const banking = permissions.banking || {};
    const accounts = (banking.accounts || []).filter(a => a.visible);
    const singleAccount = accounts.length === 1;
    if (singleAccount) {
      // Single account - use a generig title
      this.title = this.i18n('Account status');
    } else {
      // Multiple accounts - use the account type name
      this.title = this.account.type.name;
    }

    // The heading actions
    this.headingActions = [{
      icon: 'search',
      label: this.i18n('View'),
      maybeRoot: true,
      onClick: () => this.router.navigate(['/banking', 'account', ApiHelper.internalNameOrId(this.account.type)])
    }];

    // Fetch the balance history
    this.addSub(this.accountsService.getAccountBalanceHistory({
      fields: ['account.id', 'account.status.balance', 'account.currency', 'account.type', 'balances'],
      owner: ApiHelper.SELF,
      accountType: this.account.type.id,
      datePeriod: [this.dataForUiHolder.now().subtract(6, 'months').startOf('month').format(ISO_DATE)],
      intervalUnit: TimeFieldEnum.MONTHS
    }).subscribe(history => {
      this.history$.next(history);
      this.currency = history.account.currency;
      this.account = history.account;
      this.balance = history.account.status.balance;
      this.notifyReady();
    }));

    // If we need to show the max transfers, fetch them
    if (this.maxTransfers > 0) {
      this.addSub(this.accountsService.searchAccountHistory({
        fields: [],
        owner: 'self',
        accountType: this.account.type.id,
        direction: 'credit',
        pageSize: 3
      }).subscribe(transfers => {
        this.lastPayments$.next(transfers);
        this.notifyReady();
      }));
    }
  }

  subjectName(row: AccountHistoryResult): string {
    return ApiHelper.subjectName(row, this.format);
  }

  transferPath(row: AccountHistoryResult): string[] {
    return ['/banking', 'transfer', ApiHelper.transactionNumberOrId(row)];
  }
}
