import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { TransactionAuthorizationStatusEnum, TransactionKind } from 'app/api/models';
import { TransactionsService } from 'app/api/services';
import { BaseTransactionsSearch } from 'app/banking/transactions/base-transactions-search.component';
import { FieldOption } from 'app/shared/field-option';

/**
 * Search for authorized payments
 */
@Component({
  selector: 'search-authorized-payments',
  templateUrl: 'search-authorized-payments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchAuthorizedPaymentsComponent
  extends BaseTransactionsSearch implements OnInit {

  constructor(
    injector: Injector,
    i18n: I18n
  ) {
    super(injector, i18n);
  }

  getKinds() {
    return [
      TransactionKind.PAYMENT, TransactionKind.ORDER,
      TransactionKind.SCHEDULED_PAYMENT, TransactionKind.RECURRING_PAYMENT
    ];
  }

  ngOnInit() {
    super.ngOnInit();
    this.form.patchValue(
      { status: TransactionAuthorizationStatusEnum.PENDING },
      { emitEvent: false }
    );
  }

  get statusOptions(): FieldOption[] {
    return TransactionAuthorizationStatusEnum.values().map(st => ({
      value: st,
      text: this.transactionStatusService.authorizationStatus(st)
    }));
  }

  protected buildQuery(value: any): TransactionsService.SearchTransactionsParams {
    const query = super.buildQuery(value);
    query.authorizationStatuses = [value.status];
    return query;
  }

}
