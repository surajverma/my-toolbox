// src/components/TagCloud.tsx
'use client';

export interface Tag {
  text: string;
  weight: number;
  slug: string; // We'll keep slug for potential future use but won't navigate
}

interface TagCloudProps {
  tags: Tag[];
  onTagClick: (tagText: string) => void;
  selectedTag: string | null;
}

// =================================================================
// START: NEW HELPER FUNCTION
// This function determines the CSS classes based on tag weight.
// =================================================================
const getTagStyle = (weight: number): string => {
  if (weight > 5) {
    // Most prominent tags (e.g., developer)
    return 'text-base font-bold px-5 py-2.5';
  }
  if (weight > 3) {
    // Very common tags (e.g., image, text)
    return 'text-base font-semibold px-4 py-2';
  }
  if (weight > 1) {
    // Common tags (e.g., color, design)
    return 'text-sm font-medium px-4 py-2';
  }
  // Least common tags
  return 'text-xs font-medium px-3 py-1.5';
};
// =================================================================
// END: NEW HELPER FUNCTION
// =================================================================

const TagCloud = ({ tags, onTagClick, selectedTag }: TagCloudProps) => {
  if (!tags || tags.length === 0) {
    return <p className='text-slate-500'>No popular tags to display right now.</p>;
  }

  return (
    <div className='flex flex-wrap gap-3 items-center justify-center'>
      {tags.map((tag) => {
        const isSelected = selectedTag === tag.text;
        const sizeStyle = getTagStyle(tag.weight); // Get dynamic styles

        return (
          <button
            key={tag.text}
            onClick={() => onTagClick(tag.text)}
            // Combine base styles with dynamic size styles
            className={`rounded-full transition-colors duration-150 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50
              ${sizeStyle} 
              ${
                isSelected
                  ? 'bg-sky-600 text-white hover:bg-sky-700'
                  : 'bg-sky-100 text-sky-700 hover:bg-sky-200 hover:text-sky-800'
              }
            `}>
            {tag.text}
          </button>
        );
      })}
    </div>
  );
};

export default TagCloud;
