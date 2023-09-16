import Navbar from "./components/Navbar/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import styles from "./App.module.css";
import Protected from "./components/Protected/Protected";
import Error from "./pages/Error/Error";
import Login from './pages/Login/Login';
import { useSelector } from "react-redux";
import Signup from "./pages/Signup/Signup";
function App() {
  const isAuth = useSelector((state)=> state.user.auth);
  return (
    <div className={styles.container}>
      <BrowserRouter>
        <div className={styles.layout}>
          <Navbar />
          <Routes>
            <Route
              path="/"
              //path='/home'
              //if path prop match then
              //trigger element as result
              exact //should match exactly
              element={
                <div className={styles.main}>
                  <Home />
                </div>
              }
            />
            <Route
              path="table"
              exact
              element={<div className={styles.main}>table</div>}
            />
            <Route
              path="blogs"
              exact
              element={<Protected isAuth={isAuth}>
              <div className={styles.main}>blogs</div>
              </Protected>}
            />
            <Route
              path="submit"
              exact
              element={<Protected isAuth={isAuth}>
              <div className={styles.main}>submit</div>
              </Protected>}
            />
            <Route
              path="login"
              exact
              element={<div className={styles.main}><Login /></div>}
            />
            <Route
              path="signup"
              exact
              element={<div className={styles.main}><Signup/></div>}
            />
            <Route
            path='*'
            element={<div className={styles.main}><Error/></div>}
            />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
