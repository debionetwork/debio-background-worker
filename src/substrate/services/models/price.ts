export class Price {
  constructor(_component: any, _value: any) {
    const decoder = new TextDecoder();

    this.component = decoder.decode(_component);
    this.value = _value;
  }
  component: string;
  value: number;
}
