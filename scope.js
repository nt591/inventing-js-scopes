// let's reinvent scope!
// scope can be thought of as 
// environments -> maps of keys to values, 
// scopes - stack of environments
// function calls entering a function

class Environment {
  constructor(environment, store) {
    this.outer = environment;
    this.store = {};
  }

  get(name) {
    if (this.store[name]) return this.store[name];
    if (this.outer) return this.outer.get(name);
    return null;
  }

  set(name, value) {
    return this.store[name] = value;
  }
}

const GLOBAL_ENV = new Environment();

function assign(env, name, value) {
  env.set(name, value);
}

function read(env, name) {
  env.get(name);
}

class FunctionObject {
  constructor(env, fn, parameters = []) {
    this.fn = fn;
    this.parameters = parameters;
    // capture state of environment at creation time
    this.env = env;
  }

  eval(env, paramValues) {
    // assign an outer environment
    let newEnv = new Environment(env, this.env.store)
    for (let i = 0; i < paramValues.length; i++) {
      // mix
      let param = this.parameters[i];
      let val = paramValues[i];
      newEnv.set(param, val);
    }

    // apply args from params to fn
    let allParamValues = this.parameters.map(param => newEnv.get(param));
    let argsToCall = [newEnv].concat(allParamValues);
    return this.fn.apply(newEnv, argsToCall);
  }
}

const functionScope = (env) => {
  let localEnv = new Environment(env)
  assign(localEnv, 'x', 1);
  assign(localEnv, 'y', 2);
  assign(localEnv, 'z', 100);
  let sumFn = (env, x, y) => console.log('OUTER ', env.get('x') + env.get('y') + env.get('z'));
  let sum = new FunctionObject(localEnv, sumFn, ['x', 'y', 'z']);
  sum.eval(localEnv, [5, 6]) // expect 5 + 6 + 100 = 111
  assign(localEnv, 'z', 200);
  sum.eval(localEnv, [5, 6]) // expect 5 + 6 + 200 = 211
  innerScope(localEnv);
  sum.eval(localEnv, [100, 100]) // expect 100 + 100 + 200 = 400
}

const innerScope = env => {
  let localEnv = new Environment(env);
  assign(localEnv, 'z', 300)
  let sumFn = (env, x, y) => console.log('INNER ', env.get('x') + env.get('y') + env.get('z'));
  let sum = new FunctionObject(localEnv, sumFn, ['x', 'y', 'z']);
  sum.eval(localEnv, [5, 6]) // expect 5 + 6 + 100 = 111
}

functionScope(GLOBAL_ENV)
