import { NgClass } from '@angular/common';
import {
  Component,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [NgClass],
  template: ` <p class="result-count">
      Showing
      <select
        name="result-count"
        id="result-count"
        (change)="setPageLimit($event)"
      >
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="20" selected>20</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
      results per page
    </p>
    <div class="button-container">
      <button
        title="First"
        class="base-button step-button"
        [disabled]="current() === 1"
        (click)="setCurrent(1)"
      >
        <span class="material-icons">first_page</span>
      </button>
      <button
        title="Previous"
        class="base-button step-button"
        [disabled]="current() === 1"
        (click)="setCurrent(current() - 1)"
      >
        <span class="material-icons">keyboard_arrow_left</span>
      </button>
      @for(page of visiblePages(); track $index){
      <button
        [disabled]="page.selected"
        class="base-button page-button"
        [ngClass]="{ selected: page.selected }"
        (click)="setCurrent(page.num)"
      >
        {{ page.num }}
      </button>
      }
      <button
        title="Next"
        class="base-button step-button"
        [disabled]="current() === lastPage()"
        (click)="setCurrent(current() + 1)"
      >
        <span class="material-icons">keyboard_arrow_right</span>
      </button>
      <button
        title="{{ 'Last (' + lastPage() + ')' }}"
        class="base-button step-button"
        [disabled]="current() === lastPage()"
        (click)="setCurrent(lastPage())"
      >
        <span class="material-icons">last_page</span>
      </button>
    </div>`,
  styleUrl: `pagination.css`,
})
export class Pagination {
  current = signal<number>(1);
  setPage = output<number>();
  limit = model<number>();
  lastPage = input.required<number>();
  beforeAndAfterCount = input<number>(2);
  visiblePages = computed<{ num: number; selected: boolean }[]>(() => {
    const current = this.current();
    const lastPage = this.lastPage();
    const beforeAndAfterCount = this.beforeAndAfterCount();
    const pages: { num: number; selected: boolean }[] = [];
    let smallestVisible: number, biggestVisible: number;
    const totalCount = 2 * beforeAndAfterCount + 1;

    if (totalCount >= lastPage) {
      smallestVisible = 1;
      biggestVisible = lastPage;
    } else {
      const beforeCount = current - 1;
      const afterCount = lastPage - current;

      if (beforeCount < beforeAndAfterCount) {
        smallestVisible = 1;
        biggestVisible = totalCount;
      } else if (afterCount < beforeAndAfterCount) {
        biggestVisible = lastPage;
        smallestVisible = lastPage - totalCount + 1;
      } else {
        smallestVisible = current - beforeAndAfterCount;
        biggestVisible = current + beforeAndAfterCount;
      }
    }

    for (let i = smallestVisible; i < current; i++) {
      pages.push({ num: i, selected: false });
    }
    pages.push({ num: current, selected: true });
    for (let i = current + 1; i <= biggestVisible; i++) {
      pages.push({ num: i, selected: false });
    }
    return pages;
  });

  setCurrent(page: number) {
    this.current.set(page);
    this.setPage.emit(page);
  }

  setPageLimit(event: Event) {
    const target = event.target as HTMLSelectElement | null;
    if (target) {
      this.limit.update((cur) => parseInt(target.value));
    }
  }
}
