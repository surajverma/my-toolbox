// src/components/Footer.tsx
const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className='bg-gradient-to-r from-sky-800 to-indigo-900 text-slate-200 text-center p-8 mt-16 rounded-t-2xl shadow-inner'>
      <p className='text-sm'>
        &copy; {currentYear} 
        <a href='https://www.surajverma.in' target='_blank' rel='noopener noreferrer' className='ml-1 underline hover:text-sky-200'>
          Suraj Verma
        </a> . No rights reserved. 
      </p>
      <p className='mt-2 text-sm opacity-80'>
        This project is free to use, copy, and distribute. View on <a href="https://github.com/SurajVerma/toolstack" target="_blank" rel="noopener noreferrer" className="underline hover:text-sky-200">GitHub</a> |
        <a href="/LICENSE" className="underline hover:text-sky-200 ml-1">MIT License</a>
      </p>
    </footer>
  );
};

export default Footer;
