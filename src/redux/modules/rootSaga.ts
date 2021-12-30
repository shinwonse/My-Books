import { all } from "redux-saga/effects";
import { authSaga } from "./auth";

export default function* rootSaga() {
  // 제너레이터 함수. return값이 여러개일때 필요에 따라 하나씩 반환 (yield) 가능

  yield all([authSaga()]); // 배열로 하위 saga들을 넣어줘야 함. 실행도 해줬음

  // all함수를 사용해서 제너레이터 함수를 배열의 형태로 인자로 넣어주면, 제너레이터 함수들이 병렬적으로 동시에 실행되고, 전부 resolve될때까지 기다린다. Promise.all과 비슷하다고 보면된다.
  // 예시: yield all([testSaga1(), testSaga2()])
  // → testSaga1()과 testSaga2()가 동시에 실행되고, 모두 resolve될 때까지 기다린다.
}
