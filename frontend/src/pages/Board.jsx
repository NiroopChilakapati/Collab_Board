    import { useEffect, useState } from 'react';
    import { useParams } from 'react-router-dom';
    import { DndContext } from '@dnd-kit/core';
    import api from '../api/axios';
    import socket from '../socket/socket';
    import Column from '../components/Column';

    export default function Board() {
    const { id } = useParams();

    const [board, setBoard] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [activities, setActivities] = useState([]);

    const [form, setForm] = useState({
        title: '',
        description: ''
    });

    const [inviteEmail, setInviteEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function loadActivities() {
        try {
        const res = await api.get(`/activities/${id}`);
        setActivities(res.data);
        } catch (err) {
        console.error(err);
        }
    }

    async function loadBoard() {
        try {
        const res = await api.get(`/boards/${id}`);
        setBoard(res.data.board);
        setTasks(res.data.tasks);
        setMembers(res.data.members);

        const activityRes = await api.get(`/activities/${id}`);
        setActivities(activityRes.data);
        } catch (err) {
        setError(err.response?.data?.message || 'Failed to load board');
        }
    }

    async function inviteMember(e) {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!inviteEmail.trim()) return;

        try {
        const res = await api.post(`/boards/${id}/invite`, {
            email: inviteEmail
        });

        setMembers((prev) => [...prev, res.data.member]);
        setInviteEmail('');
        setSuccess('Member invited successfully');
        } catch (err) {
        setError(err.response?.data?.message || 'Failed to invite member');
        }
    }

    async function createTask(e) {
        e.preventDefault();

        if (!form.title.trim()) return;

        try {
        const res = await api.post('/tasks', {
            title: form.title,
            description: form.description,
            status: 'todo',
            board_id: id
        });

        setTasks((prev) => [res.data, ...prev]);

        socket.emit('task-created', {
            boardId: id,
            task: res.data
        });

        setForm({
            title: '',
            description: ''
        });

        await loadActivities();
        } catch (err) {
        setError(err.response?.data?.message || 'Failed to create task');
        }
    }

    async function updateTaskStatus(taskId, status) {
        try {
        const res = await api.patch(`/tasks/${taskId}/status`, { status });

        setTasks((prev) =>
            prev.map((task) => (task.id === taskId ? res.data : task))
        );

        socket.emit('task-updated', {
            boardId: id,
            task: res.data
        });

        await loadActivities();
        } catch (err) {
        setError(err.response?.data?.message || 'Failed to update task');
        }
    }

    async function deleteTask(taskId) {
        try {
        await api.delete(`/tasks/${taskId}`);

        setTasks((prev) => prev.filter((task) => task.id !== taskId));

        socket.emit('task-deleted', {
            boardId: id,
            taskId
        });

        await loadActivities();
        } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete task');
        }
    }

    function handleDragEnd(event) {
        const { active, over } = event;

        if (!over) return;

        const taskId = active.id;
        const newStatus = over.id;

        const task = tasks.find((t) => t.id === taskId);

        if (!task || task.status === newStatus) return;

        updateTaskStatus(taskId, newStatus);
    }

    useEffect(() => {
        loadBoard();

        socket.connect();
        socket.emit('join-board', id);

        socket.on('task-created', (task) => {
        setTasks((prev) => [task, ...prev]);
        loadActivities();
        });

        socket.on('task-updated', (updatedTask) => {
        setTasks((prev) =>
            prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
        );
        loadActivities();
        });

        socket.on('task-deleted', (taskId) => {
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
        loadActivities();
        });

        return () => {
        socket.off('task-created');
        socket.off('task-updated');
        socket.off('task-deleted');
        socket.disconnect();
        };
    }, [id]);

    return (
        <div className="p-8">
        {error && (
            <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>
        )}

        {success && (
            <p className="bg-green-100 text-green-700 p-3 rounded mb-4">
            {success}
            </p>
        )}

        <div className="flex flex-col lg:flex-row lg:justify-between gap-6 mb-8">
            <div>
            <h1 className="text-3xl font-bold">
                {board ? board.title : 'Loading...'}
            </h1>

            <p className="text-gray-600 mt-1">
                Shared realtime board with team collaboration.
            </p>

            <div className="mt-4 bg-white rounded-2xl shadow p-4">
                <h2 className="font-bold mb-3">Board Members</h2>

                <div className="space-y-2">
                {members.map((member) => (
                    <div
                    key={member.id}
                    className="flex justify-between items-center border-b pb-2"
                    >
                    <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                    </div>

                    <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                        {member.role}
                    </span>
                    </div>
                ))}
                </div>
            </div>
            </div>

            <div className="flex flex-col gap-4 w-full lg:w-[420px]">
            {board?.role === 'owner' && (
                <form
                onSubmit={inviteMember}
                className="bg-white p-4 rounded-2xl shadow"
                >
                <h2 className="font-bold mb-3">Invite Member</h2>

                <input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter registered user email"
                    className="w-full border p-3 rounded-lg mb-3"
                />

                <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg w-full">
                    Invite
                </button>
                </form>
            )}

            <form
                onSubmit={createTask}
                className="bg-white p-4 rounded-2xl shadow"
            >
                <h2 className="font-bold mb-3">Add Task</h2>

                <input
                value={form.title}
                onChange={(e) =>
                    setForm({
                    ...form,
                    title: e.target.value
                    })
                }
                placeholder="Task title"
                className="w-full border p-3 rounded-lg mb-3"
                />

                <textarea
                value={form.description}
                onChange={(e) =>
                    setForm({
                    ...form,
                    description: e.target.value
                    })
                }
                placeholder="Task description"
                className="w-full border p-3 rounded-lg mb-3"
                />

                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg w-full">
                Add Task
                </button>
            </form>
            </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
            <DndContext onDragEnd={handleDragEnd}>
                <div className="grid md:grid-cols-3 gap-6">
                <Column
                    title="Todo"
                    status="todo"
                    tasks={tasks}
                    onDelete={deleteTask}
                />

                <Column
                    title="In Progress"
                    status="progress"
                    tasks={tasks}
                    onDelete={deleteTask}
                />

                <Column
                    title="Done"
                    status="done"
                    tasks={tasks}
                    onDelete={deleteTask}
                />
                </div>
            </DndContext>
            </div>

            <div className="bg-white rounded-2xl shadow p-4 h-fit">
            <h2 className="text-xl font-bold mb-4">Activity Feed</h2>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {activities.length === 0 ? (
                <p className="text-gray-500 text-sm">No activities yet</p>
                ) : (
                activities.map((activity) => (
                    <div key={activity.id} className="border-b pb-3">
                    <p className="text-sm text-gray-800">{activity.action}</p>

                    <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.created_at).toLocaleString()}
                    </p>
                    </div>
                ))
                )}
            </div>
            </div>
        </div>
        </div>
    );
    }