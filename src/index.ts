import observable from "./observable";
import Reactive from "./internals";

const a = {'a': 1};
const b = {'b': 2};

const oba = observable(a);
const obb = observable(b);

oba.a++;
obb.b++;
oba.a++;
oba.a++;

const bs = new WeakMap<typeof oba, typeof obb>();

