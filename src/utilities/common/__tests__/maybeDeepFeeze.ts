import { maybeDeepFreeze, maybeExcludeFreeze } from "../maybeDeepFreeze";

describe("maybeDeepFreeze", () => {
  it("should deep freeze", () => {
    const foo: any = { bar: undefined };
    maybeDeepFreeze(foo);
    expect(() => (foo.bar = 1)).toThrow();
    expect(foo.bar).toBeUndefined();
  });

  it("should properly freeze objects without hasOwnProperty", () => {
    const foo = Object.create(null);
    foo.bar = undefined;
    maybeDeepFreeze(foo);
    expect(() => (foo.bar = 1)).toThrow();
  });

  it("should avoid freezing Uint8Array", () => {
    const result = maybeDeepFreeze({ array: new Uint8Array(1) });
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.array)).toBe(false);
  });

  it("should avoid freezing Buffer", () => {
    const result = maybeDeepFreeze({ oyez: Buffer.from("oyez") });
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.oyez)).toBe(false);
  });

  it("should not freeze child properties of unfreezable objects", () => {
    const result = maybeDeepFreeze({
      buffer: Object.assign(Buffer.from("oyez"), {
        doNotFreeze: { please: "thanks" },
      }),
    });
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.buffer)).toBe(false);
    expect(Object.isFrozen(result.buffer.doNotFreeze)).toBe(false);
    expect(result.buffer.doNotFreeze).toEqual({ please: "thanks" });
  });

  it("should avoid freezing excluded prototype", () => {
    class NoFreeze {
      value = "mutable";
    }
    maybeExcludeFreeze(NoFreeze.prototype);

    const result = maybeDeepFreeze(new NoFreeze());

    expect(Object.isFrozen(result)).toBe(false);

    expect(() => {
      result.value = "changed";
    }).not.toThrow();
  });

  it("should avoid freezing nested property of excluded prototype", () => {
    class InnerNoFreeze {
      innerValue = "mutable";
    }
    class NoFreeze {
      inner = new InnerNoFreeze();
    }
    maybeExcludeFreeze(NoFreeze.prototype);

    const result = maybeDeepFreeze(new NoFreeze());

    expect(Object.isFrozen(result)).toBe(false);

    expect(() => {
      result.inner.innerValue = "changed";
    }).not.toThrow();
  });
});
