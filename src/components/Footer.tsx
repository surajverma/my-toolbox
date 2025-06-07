// src/components/Footer.tsx
const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className='bg-slate-700 text-slate-300 text-center p-6 mt-12'>
      <p>
        &copy; {currentYear}{' '}
        <a href='https://www.surajverma.in' target='_blank' rel='noopener noreferrer'>
          Suraj Verma
        </a>
        . No rights reserved.
      </p>
      <p className='mt-1 text-sm'>
        {/* <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link> | 
        <Link href="/terms" className="hover:text-white">Terms of Service</Link> */}
        Privacy-focused utilities for everyone.
      </p>
    </footer>
  );
};

export default Footer;
