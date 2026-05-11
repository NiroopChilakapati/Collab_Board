import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';

export default function Column({ title, status, tasks, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status
  });

  const filteredTasks = tasks.filter((task) => task.status === status);

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl p-4 min-h-[400px] transition ${
        isOver ? 'bg-blue-100' : 'bg-gray-200'
      }`}
    >
      <h2 className="text-xl font-bold mb-4">
        {title} ({filteredTasks.length})
      </h2>

      {filteredTasks.length === 0 ? (
        <p className="text-gray-500 text-sm">Drop tasks here</p>
      ) : (
        filteredTasks.map((task) => (
          <TaskCard key={task.id} task={task} onDelete={onDelete} />
        ))
      )}
    </div>
  );
}