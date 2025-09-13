// src/components/ToolCard.tsx
import Link from 'next/link';
import type { Tool } from '@/app/page'; // Or from '@/types'

interface ToolCardProps {
  tool: Tool;
}

const ToolCard = ({ tool }: ToolCardProps) => {
  return (
    <Link
      href={tool.slug}
      className='block p-6 bg-white/90 rounded-2xl shadow-lg hover:shadow-2xl border border-slate-100 hover:border-sky-200 transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50'>
      {/* You can add an icon here later if you have one */}
      {/* {tool.icon && <img src={tool.icon} alt={`${tool.name} icon`} className="w-8 h-8 mb-2" />} */}

      <h3 className='text-xl font-extrabold text-slate-800 mb-2 font-heading tracking-tight'>{tool.name}</h3>
      <p className='text-slate-600 text-base mb-3'>{tool.description}</p>

      {tool.tags && tool.tags.length > 0 && (
        <div className='flex flex-wrap gap-2 mt-2'>
          {tool.tags.map((tag) => (
            <span key={tag} className='text-xs bg-gradient-to-r from-sky-100 to-indigo-100 text-sky-700 px-2 py-1 rounded-full font-medium'>
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
};

export default ToolCard;
