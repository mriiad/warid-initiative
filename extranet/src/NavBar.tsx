import { makeStyles } from '@mui/styles';
import React from 'react';
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';


const Home = () => <div>Home Page</div>;
const About = () => <div>About Page</div>;
const Contact = () => <div>Contact Page</div>;

const useStyles = makeStyles({
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'green',
    padding: '10px',
  },
  logo: {
    marginRight: '10px',
  },
  routes: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  routesList: {
    listStyleType: 'none',
    margin: 0,
    padding: 0,
  },
  routesListItem: {
    marginRight: '10px',
  },
  routesLink: {
    color: 'white',
    textDecoration: 'none',
  },
});

const Navbar: React.FC = () => {
  const classes = useStyles();

  return (
    <Router>
      <div className={classes.navbar}>
        <div className={classes.logo}>
          <img src="logo.png" alt="Logo" />
        </div>
        <div className={classes.routes}>
          <nav>
            <ul className={classes.routesList}>
              <li className={classes.routesListItem}>
                <Link to="/" className={classes.routesLink}>
                  Home
                </Link>
              </li>
              <li className={classes.routesListItem}>
                <Link to="/about" className={classes.routesLink}>
                  About
                </Link>
              </li>
              <li className={classes.routesListItem}>
                <Link to="/contact" className={classes.routesLink}>
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default Navbar;