// src/components/Navbar.tsx
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className='bg-slate-800 text-white shadow-md'>
      <div className='container mx-auto px-4 py-4 flex justify-between items-center'>
        <Link href='/' className='text-2xl font-bold hover:text-slate-300'>
          My ToolBox
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
