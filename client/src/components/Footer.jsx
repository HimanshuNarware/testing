import React from 'react';
import { Link } from 'wouter';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin 
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">MedConnect</h3>
            <p className="text-gray-400 mb-4">Connecting patients with the right healthcare professionals for better care.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">For Patients</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/find-doctors">
                  <a className="text-gray-400 hover:text-white">Find Doctors</a>
                </Link>
              </li>
              <li>
                <Link href="/appointments">
                  <a className="text-gray-400 hover:text-white">Book Appointments</a>
                </Link>
              </li>
              <li>
                <Link href="/patient-dashboard">
                  <a className="text-gray-400 hover:text-white">Medical Records</a>
                </Link>
              </li>
              <li>
                <Link href="/community">
                  <a className="text-gray-400 hover:text-white">Health Articles</a>
                </Link>
              </li>
              <li>
                <Link href="/community">
                  <a className="text-gray-400 hover:text-white">Patient Forum</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">For Doctors</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/signup">
                  <a className="text-gray-400 hover:text-white">Register Your Practice</a>
                </Link>
              </li>
              <li>
                <Link href="/doctor-dashboard">
                  <a className="text-gray-400 hover:text-white">Doctor Dashboard</a>
                </Link>
              </li>
              <li>
                <Link href="/doctor-dashboard">
                  <a className="text-gray-400 hover:text-white">Patient Management</a>
                </Link>
              </li>
              <li>
                <Link href="/doctor-dashboard">
                  <a className="text-gray-400 hover:text-white">Telehealth Tools</a>
                </Link>
              </li>
              <li>
                <Link href="/community">
                  <a className="text-gray-400 hover:text-white">Resources</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white">Help Center</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">Contact Us</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-400">&copy; {new Date().getFullYear()} MedConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;