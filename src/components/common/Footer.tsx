
import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">PG Finder</h3>
            <p className="text-gray-600 text-sm">
              Find the perfect Paying Guest accommodation for your needs.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/listings" className="text-gray-600 hover:text-primary text-sm">
                  Browse PGs
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-600 hover:text-primary text-sm">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:text-primary text-sm">
                  Register
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">For PG Owners</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/add-listing" className="text-gray-600 hover:text-primary text-sm">
                  List Your PG
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-600 hover:text-primary text-sm">
                  Manage Listings
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Help & Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary text-sm">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary text-sm">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary text-sm">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-6 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} PG Finder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
