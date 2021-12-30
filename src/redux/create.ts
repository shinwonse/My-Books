import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import reducer from "./modules/reducer";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./modules/rootSaga";
import { routerMiddleware } from "connected-react-router";
import history from "../history";

const create = () => {
  const sagaMiddleware = createSagaMiddleware(); // sagaMiddleware 생성

  const store = createStore(
    reducer(history),
    composeWithDevTools(
      applyMiddleware(sagaMiddleware, routerMiddleware(history))
    ) // sagaMiddleware를 applyMiddleware에 연결
  );

  sagaMiddleware.run(rootSaga); // 인자로 rootSaga를 넣어줘야함

  return store;
};

export default create;
