import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { ContentPage } from 'app/content/content-page';
import { BasePageComponent } from 'app/shared/base-page.component';
import { I18n } from '@ngx-translate/i18n-polyfill';

/**
 * Displays a content page with layout
 */
@Component({
  selector: 'content-page',
  templateUrl: 'content-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentPageComponent extends BasePageComponent<ContentPage> implements OnInit {

  get page(): ContentPage {
    return this.data;
  }

  constructor(
    injector: Injector,
    i18n: I18n) {
    super(injector, i18n);
  }

  ngOnInit() {
    super.ngOnInit();
    const slug = this.route.snapshot.params.slug;
    this.menu.setActiveContentPageSlug(slug);
    this.addSub(this.menu.contentPages$.subscribe(pages => {
      if (pages == null) {
        return;
      }
      const page = pages.find(p => p.slug === slug);
      if (page) {
        this.data = page;
        this.layout.fullWidth = page.layout === 'full';
        this.layout.setTitle(page.title || page.label);
      } else {
        this.errorHandler.handleNotFoundError({});
      }
    }));
  }

}
