export class Price {
  constructor(price: any) {
    this.component = price.component;
    this.value = price.value;
  }
  component: string;
  value: string;
}
