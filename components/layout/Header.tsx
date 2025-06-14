
import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME, LOGO_SVG } from '../../constants';

const Header: React.FC = () => {
  return (
    <header className="bg-primary-dark text-text-light shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center text-xl font-bold">
          {LOGO_SVG}
          <span>{APP_NAME}</span>
        </Link>
        {/* User profile / settings can go here */}
        <div>
          {/* Example: <span className="text-sm">Welcome, Admin!</span> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
