
```ts

function of() {
  
}

function from() {
  
}

function create(other?: Partial<State>): ICache {
  return getDurableObj(partial);
}

function getDurableObj(partial?: Partial<State>): ICache {
  const state = getDefaultState(partial);
  return {
    name(name?: string): string {
      if (name) state.name = name;
      return state.name;
    }
  }
}

function getDefaultState(partial?: Partial<State>): IState {
  return {
    sessionUser: partial?.sessionUser ?? User.create(),
    
  }
}
```
