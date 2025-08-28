import React from 'react';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-4">
    <div className="container mx-auto text-center text-sm">
      © {new Date().getFullYear()} Playniti. All rights reserved.
    </div>
  </footer>
);

export default Footer;