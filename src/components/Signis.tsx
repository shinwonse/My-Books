import { Button, Col, Input, Row } from "antd";
import { useRef } from "react";
import { LoginReqType } from "../types";
import styles from "./Signin.module.css";

interface SigninProps {
  login: (reqData: LoginReqType) => void; // void로 return되는 함수
}

const Signin: React.FC<SigninProps> = ({ login }) => {
  const emailRef = useRef<Input>(null); // 제너릭으로 antd의 Input 컴포넌트를 넣음
  const passwordRef = useRef<Input>(null); // useRef로 DOM 직접 선택
  return (
    <Row align="middle" className={styles.signin_row}>
      <Col span={24}>
        <Row className={styles.signin_contents}>
          <Col span={12}>
            <img
              src="/bg_signin.png"
              alt="Signin"
              className={styles.signin_bg}
            />
          </Col>
          <Col span={12}>
            <div className={styles.signin_title}>My Books</div>
            <div className={styles.signin_subtitle}>
              Please Note Your Opinion
            </div>
            <div className={styles.signin_underline} />
            <div className={styles.email_title}>
              Email
              <span className={styles.required}> *</span>
            </div>
            <div className={styles.input_area}>
              <Input
                placeholder="Email"
                autoComplete="email"
                name="email"
                className={styles.input}
                ref={emailRef}
              />
            </div>
            <div className={styles.password_title}>
              Password
              <span className={styles.required}> *</span>
            </div>
            <div className={styles.input_area}>
              <Input
                type="password"
                autoComplete="current-password"
                className={styles.input}
                ref={passwordRef}
              />
            </div>
            <div className={styles.button_area}>
              <Button size="large" className={styles.button} onClick={click}>
                Sign In
              </Button>
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  );

  function click() {
    const email = emailRef.current!.state.value; // emailRef.current 까지 하면 null 혹은 Input이 나옴 Non-null assertion을 사용해서 null일 가능성을 없애줌. 타입이 Input으로 고정됨
    const password = passwordRef.current!.state.value;

    login({ email, password });
  }
};

export default Signin;
