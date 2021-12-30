import { push } from "connected-react-router";
import { Action, createActions, handleActions } from "redux-actions";
import { call, put, takeEvery } from "redux-saga/effects";
import TokenService from "../../services/TokenService";
import UserService from "../../services/UserService";
import { LoginReqType } from "../../types";

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

// saga
export const { login, logout } = createActions("LOGIN", "LOGOUT", { prefix });

function* loginSaga(action: Action<LoginReqType>) {
  try {
    yield put(pending());
    const token: string = yield call(UserService.login, action.payload);
    TokenService.set(token);
    yield put(success(token));
    yield put(push("/"));
  } catch (error: any) {
    yield put(fail(new Error(error?.response?.data.error || "UNKNOWN_ERROR")));
  }
  // login이라는 액션이 디스패치되면 실행
}

function* logoutSaga() {
  // logout이라는 액션이 디스패치되면 실행
}

export function* authSaga() {
  // auth에서 side effect가 일어나는 여러가지 로직들을 작성
  yield takeEvery(`${prefix}/LOGIN`, loginSaga);
  yield takeEvery(`${prefix}/LOGOUT`, logoutSaga);
}
