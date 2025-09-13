// src/components/Navbar.tsx
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className='bg-gradient-to-r from-sky-700 to-indigo-800 text-white shadow-md'>
      <div className='container mx-auto px-4 py-4 flex justify-between items-center'>
        <Link href='/' className='text-3xl font-extrabold tracking-tight hover:text-sky-200 font-heading drop-shadow-sm'>
          ToolStack
        </Link>
        {/* Future Nav Links can go here */}
        {/* <div className="space-x-4">
          <Link href="/about" className="hover:text-slate-300">About</Link>
          <Link href="/tools" className="hover:text-slate-300">All Tools</Link>
        </div> */}
      </div>
    </nav>
  );
};

export default Navbar;
