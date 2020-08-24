import React from "react";
import Login from "./view/pages/Admin/components/Login/Login"
import forgotPassword from "./view/pages/Admin/components/ForgotPassword/ForgotPassword"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import ForgotPassword from "./view/pages/Admin/components/ForgotPassword/ForgotPassword";

 function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
          <li>
              <Link to="/">Log In</Link>
            {/* </li>
          <li>
              <Link to="/register">Register</Link> */}

            </li>
          <li>
              <Link to="/forgotPassword">Forgot Password</Link>
            </li>
            <li>
              <Link to="/admin">Admin</Link>
            </li>
            <li>
              <Link to="/analysis">Analysis</Link>
            </li>
            <li>
              <Link to="/status">Status</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
        <Route exact={true} path="/">
            <Login></Login>
            
          </Route>
          <Route path="/register">
            
          </Route>
          <Route path="/forgotPassword">
              <ForgotPassword></ForgotPassword>
          </Route>
          <Route path="/admin">

          </Route>
          <Route path="/analysis">

          </Route>
          <Route path="/status">

          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;