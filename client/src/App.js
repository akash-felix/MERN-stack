import React,{ Fragment, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Alert from './components/layout/alert';
import Dashboard from './components/dashboard/Dashboard';
import {Provider} from 'react-redux';
import store from './store';
import {BrowserRouter as Router,Route,Switch} from 'react-router-dom';
import './App.css';
import {loadUser} from './actions/auth';
import setAuthToken from './utils/setAuthToken';
import PrivateRoute from './components/routing/PrivateRoute';

const App = () => {
  useEffect(() => {
    // check for token in LS
    if (localStorage.token) {
      setAuthToken(localStorage.token);
    }
    store.dispatch(loadUser());
  }, []);
  return (
  <Provider store={store}>
  <Router>
  <Fragment>
    <Navbar/>
    <Route exact path='/' component={Landing}/>
    <section className="container">
      <Alert/>
      <Switch>
        <Route exact path='/register' component={Register}/>
        <Route exact path='/login' component={Login}/>
        <PrivateRoute exact path='/dashboard' component={Dashboard}/>
      </Switch>
    </section>
    
  </Fragment>
  </Router>
  </Provider>
)};

export default App;
