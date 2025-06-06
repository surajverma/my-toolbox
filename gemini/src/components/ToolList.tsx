// src/components/ToolList.tsx
import ToolCard from './ToolCard'; // Import the ToolCard component
import type { Tool } from '@/app/page'; // Or from '@/types' if you moved it

interface ToolListProps {
  tools: Tool[];
}

const ToolList = ({ tools }: ToolListProps) => {
  if (!tools || tools.length === 0) {
    return <p className='text-slate-500'>No tools available at the moment.</p>;
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
};

export default ToolList;
