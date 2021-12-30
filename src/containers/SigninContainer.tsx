import { useCallback } from "react";
import { useDispatch } from "react-redux";
import Signin from "../components/Signis";
import { login as loginSagaStart } from "../redux/modules/auth";

export default function SigninContainer() {
  const dispatch = useDispatch();

  const login = useCallback(
    (reqData) => {
      dispatch(loginSagaStart(reqData));
    },
    [dispatch]
  );

  return <Signin login={login} />;
}
