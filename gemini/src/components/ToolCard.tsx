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
      className='block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50'>
      {/* You can add an icon here later if you have one */}
      {/* {tool.icon && <img src={tool.icon} alt={`${tool.name} icon`} className="w-8 h-8 mb-2" />} */}

      <h3 className='text-xl font-semibold text-slate-800 mb-2'>{tool.name}</h3>
      <p className='text-slate-600 text-sm mb-3'>{tool.description}</p>

      {tool.tags && tool.tags.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {tool.tags.map((tag) => (
            <span key={tag} className='text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full'>
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
};

export default ToolCard;
