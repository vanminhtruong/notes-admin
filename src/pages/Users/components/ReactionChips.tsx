import React from 'react';

export type ReactionAggregate = {
  type: string;
  count: number;
  users?: Array<{ id: number; name?: string; avatar?: string | null }>;
};

interface ReactionChipsProps {
  reactions: ReactionAggregate[];
  align?: 'start' | 'end';
}

const EMOJI: Record<string, string> = {
  like: '👍',
  love: '❤️',
  haha: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😡',
};

export default function ReactionChips({ reactions, align = 'end' }: ReactionChipsProps) {
  if (!Array.isArray(reactions) || reactions.length === 0) return null;
  const order = ['like','love','haha','wow','sad','angry'];
  const list = reactions
    .filter(r => r && typeof r.type === 'string')
    .slice()
    .sort((a,b) => order.indexOf(a.type) - order.indexOf(b.type));

  return (
    <div className={`mt-1 inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 border ${align==='end' ? 'justify-end' : 'justify-start'} bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 text-gray-800 dark:text-gray-200`}
         title={list.map(r => `${EMOJI[r.type] || r.type} ${r.count}`).join(' · ')}>
      {list.map(r => (
        <span key={r.type} className="inline-flex items-center gap-0.5">
          <span>{EMOJI[r.type] || r.type}</span>
          <span>{r.count}</span>
        </span>
      ))}
    </div>
  );
}
