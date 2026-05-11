import { useDraggable } from '@dnd-kit/core';

export default function TaskCard({ task, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id
    });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        opacity: isDragging ? 0.5 : 1
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white p-4 rounded-xl shadow mb-3 cursor-grab"
    >
      <h3 className="font-bold text-gray-800">{task.title}</h3>

      {task.description && (
        <p className="text-gray-600 text-sm mt-2">{task.description}</p>
      )}

      <div className="flex justify-end mt-4">
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onDelete(task.id)}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}