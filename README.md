# React와 TypeScript를 사용하여 나만의 책장 만들기
- TypeScript 기본 문법을 숙지하고 간단한 리액트 프로젝트를 진행하면서 타입스크립트 사용법을 익히기 위함
- 프로젝트 개발 과정을 순서대로 정리하여 리액트 프로젝트를 진행하는 로직을 이해하도록 함

***해당 프로젝트는 우리가 책을 읽고 그에 대한 느낀점 등을 적어놓는 일종의 메모장***

```TypeScript```와 ```React```로 작성할 예정이며, ```react-router-dom```,```redux```,```redux-actions```,```redux-saga```,```connected-react-router```,```ant-design```,```axios```등을 이용할 것이다.

## 라우팅 설정하기
프로젝트 개발 과정을 순서대로 정리하여 리액트 프로젝트를 진행하는 로직을 이해하도록 함

```javascript
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Add from "./pages/Add";
import Detail from "./pages/Detail";
import Edit from "./pages/Edit";
import Error from "./pages/Error";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Signin from "./pages/Signin";

function App() {
  return (
    <ErrorBoundary FallbackComponent={Error}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/add" element={<Add />} />
          <Route path="/book/:id" element={<Detail />} />
          <Route path="/edit/:id" element={<Edit />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
```
가장 먼저 위와 같이 라우팅을 설정하였다. ```react-router-dom v6```부터는 ```exact```나 ```components```를 사용하지 않는다. 이 점에 유의하여 최신 API를 적용해보았다.

## Redux 설정하기
이 프로젝트에서는 로그인 / 로그아웃 기능이 들어간다. 로그인 API는 비동기 로직이기 때문에 ```Redux```를 설정할 필요가 있다.
```npm i redux react-redux redux-saga redux-devtools-extension redux-actions```를 설치하고 설치한 패키지 중에 type definition이 내장되지 않은 패키지들은 따로 다시 설치한다. ```npm i @types/react-redux @types/redux-actions -D(dev dependency)```

```src 디렉토리```아래에 ```redux/modules 디렉토리```를 생성하고 ```auth.ts```에서 인증을 관리하도록 한다. 그리고 ```modules```안에 여러 개의 리듀서들을 하나로 합칠 수 있는 루트 리듀서를 작성할 ```reducer.ts```를 생성한다. 

다음으로 ```redux 디렉토리```아래에 ```create.ts```를 생성하여 스토어를 만드는 역할을 한다.

### 첫번째
먼저 스토어를 만드는 로직부터 작성을 해본다.
##### redux/create.js
```javascript
import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";

const create = () => {
  const store = createStore( // 루트 리듀서를 넣어줘야함
    reducer, // 일단 리듀서를 넣어주고
    composeWithDevTools(applyMiddleware()) // applyMiddleware를 composeWithDevTools로 감싸줌
  );

  return store; // create 함수가 끝나면 store 리턴
};

export default create;
```
### 두번째
이제 ```redux/modules/reducer.ts```로 가서 루트 리듀서를 만들도록 한다.

##### redux/modules/reducer.ts
```javascript
import { combineReducers } from "redux";
import auth from "./auth";

const reducer = combineReducers({ // 하위 리듀서들 설정
  auth,
});

export default reducer;
```
다시 ```redux/create.ts```로 돌아가서 reducer를 import해주도록 한다.

### 세번째
다음으로는 auth.ts에서 state를 구성한다.
##### redux/modules/auth.ts
```typescript
import { createActions, handleActions } from "redux-actions";

// AuthState 타입 설정
interface AuthState {
  token: string | null;
  loading: boolean;
  error: Error | null;
}

// 초기 state 설정
const initialState: AuthState = {
  token: null,
  loading: false,
  error: null,
};

// prefix 설정
const prefix = "my-books/auth";

// createActions를 사용하여 action 생성 함수를 만든다
export const { pending, success, fail } = createActions(
  "PENDING",
  "SUCCESS",
  "FAIL",
  { prefix } // 마지막에 prefix를 달면 액션 타입 앞에 prefix가 붙음
);

// 제너릭 타입으로 첫 번째는 AuthState, 두번째는 payload의 타입을 적음
// 여기서 payload는 토큰의 타입인 string, error의 타입인 error가 있음
const reducer = handleActions<AuthState, string>(
  // 첫번째 인자로 객체가 들어감.
  // 이 객체에는 위에 적힌 액션의 타입을 바탕으로 리듀서 로직이 만들어짐
  {
    PENDING: (state) => ({
      // 기존에 있는 state를 받음
      ...state,
      loading: true,
      error: null,
    }),
    SUCCESS: (state, action) => ({
      // 토큰을 받아서 넣어야 하므로 state와 action을 받음. action의 payload를 통해 토큰이 들어옴
      token: action.payload,
      loading: false,
      error: null,
    }),
    FAIL: (state, action: any) => ({
      // fail에 들어가는 action에는 할 수 없이 any
      ...state,
      loading: false,
      error: action.payload,
    }),
  },
   initialState, // 두번째 인자로 initialState
  { prefix } // prefix 설정
);

export default reducer;
```
### 네번째
이렇게 만들어진 auth 리듀서를 루트 리듀서에 연결한다. 이제 store에 redux-saga까지 연결한다.
##### redux/create.ts
```javascript
import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import reducer from "./modules/reducer";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./modules/rootSaga";

const create = () => {
  const sagaMiddleware = createSagaMiddleware(); // sagaMiddleware 생성

  const store = createStore(
    reducer,
    composeWithDevTools(applyMiddleware(sagaMiddleware)) // sagaMiddleware를 applyMiddleware에 연결
  );

  sagaMiddleware.run(rootSaga); // 인자로 rootSaga를 넣어줘야함

  return store;
};

export default create;
```
### 다섯번째
여기서 아직 rootSaga를 만들어주지 않았으므로 rootSaga를 modules 아래 만들어준다.
##### redux/modules/rootSaga
```javascript
import { all } from "redux-saga/effects";
import { authSaga } from "./auth";

export default function* rootSaga() {
  // 제너레이터 함수. return값이 여러개일때 필요에 따라 하나씩 반환 (yield) 가능

  yield all([authSaga()]); // 배열로 하위 saga들을 넣어줘야 함. 실행도 해줬음

  // all함수를 사용해서 제너레이터 함수를 배열의 형태로 인자로 넣어주면, 제너레이터 함수들이 병렬적으로 동시에 실행되고, 전부 resolve될때까지 기다린다. Promise.all과 비슷하다고 보면된다.
  // 예시: yield all([testSaga1(), testSaga2()])
  // → testSaga1()과 testSaga2()가 동시에 실행되고, 모두 resolve될 때까지 기다린다.
}
```
### 여섯번째
그 다음 위 코드에서 넣어준 authSaga를 만들어준다.
##### redux/create.ts
```javascript
import { createActions, handleActions } from "redux-actions";
...
// saga
export function* authSaga() {
  // auth에서 side effect가 일어나는 여러가지 로직들을 작성
}
```
이제 ```auth```에서 나만의 saga 함수를 만들어서 등록하면 비동기 로직을 쉽게 사용할 수 있다. 이제 스토어 설정이 끝났으니 본격적으로 페이지 작업을 시작해본다.
