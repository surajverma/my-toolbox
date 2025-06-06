// src/components/Footer.tsx
const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className='bg-slate-700 text-slate-300 text-center p-6 mt-12'>
      <p>&copy; {currentYear} My ToolBox. All rights reserved (or specify your license).</p>
      <p className='mt-1 text-sm'>
        {/* <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link> | 
        <Link href="/terms" className="hover:text-white">Terms of Service</Link> */}
        Privacy-focused utilities for everyone.
      </p>
    </footer>
  );
};

export default Footer;
