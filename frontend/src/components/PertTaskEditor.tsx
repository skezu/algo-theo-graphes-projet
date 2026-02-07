import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAppStore, type PertTask } from '../lib/store';

interface PertTaskEditorProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PertTaskEditor({ isOpen, onClose }: PertTaskEditorProps) {
    const { pertTasks, setPertTasks } = useAppStore();
    const [tasks, setTasks] = useState<PertTask[]>([]);

    // Form state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<PertTask>({
        id: '',
        name: '',
        duration: 1,
        predecessors: []
    });
    const [predInput, setPredInput] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTasks([...pertTasks]);
        }
    }, [isOpen, pertTasks]);

    if (!isOpen) return null;

    const handleSaveList = () => {
        setPertTasks(tasks);
        onClose();
    };

    const handleAddTask = () => {
        if (!formData.id || !formData.name) return;

        if (tasks.some(t => t.id === formData.id)) {
            alert('Task ID must be unique');
            return;
        }

        const newTask = {
            ...formData,
            predecessors: predInput.split(',').map(s => s.trim()).filter(s => s)
        };

        setTasks([...tasks, newTask]);
        resetForm();
    };

    const handleUpdateTask = () => {
        if (!formData.id || !formData.name) return;

        const updatedTasks = tasks.map(t => {
            if (t.id === editingId) {
                return {
                    ...formData,
                    predecessors: predInput.split(',').map(s => s.trim()).filter(s => s)
                };
            }
            return t;
        });

        setTasks(updatedTasks);
        resetForm();
    };

    const handleDeleteTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const handleEditClick = (task: PertTask) => {
        setEditingId(task.id);
        setFormData(task);
        setPredInput(task.predecessors.join(', '));
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ id: '', name: '', duration: 1, predecessors: [] });
        setPredInput('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div
                className="w-full max-w-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                style={{ animation: 'scale-up 0.2s ease-out' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                        Edit Project Tasks
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-[var(--bg-secondary)]">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 grid gap-6 md:grid-cols-2">

                    {/* Task List */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Tasks ({tasks.length})</h3>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                            {tasks.map(task => (
                                <div
                                    key={task.id}
                                    className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--border-hover)] transition-colors flex items-center justify-between group"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)]">
                                                {task.id}
                                            </span>
                                            <span className="font-medium text-sm">{task.name}</span>
                                        </div>
                                        <div className="text-xs text-[var(--text-tertiary)] mt-1">
                                            Dur: {task.duration} | Pred: {task.predecessors.join(', ') || '-'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEditClick(task)}>
                                            <Edit2 className="w-3 h-3" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-[var(--accent-red)] hover:text-[var(--accent-red)] hover:bg-[var(--accent-red-subtle)]" onClick={() => handleDeleteTask(task.id)}>
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {tasks.length === 0 && (
                                <div className="text-center py-8 text-[var(--text-tertiary)] text-sm italic">
                                    No tasks added.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border-subtle)] h-fit">
                        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">
                            {editingId ? 'Edit Task' : 'Add New Task'}
                        </h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-4 gap-3">
                                <div className="col-span-1 space-y-1">
                                    <Label className="text-xs">ID</Label>
                                    <Input
                                        value={formData.id}
                                        onChange={e => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                                        placeholder="A"
                                        maxLength={3}
                                    />
                                </div>
                                <div className="col-span-3 space-y-1">
                                    <Label className="text-xs">Task Name</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Project foundation"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Duration</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: parseFloat(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Predecessors (IDs, comma-separated)</Label>
                                <Input
                                    value={predInput}
                                    onChange={e => setPredInput(e.target.value)}
                                    placeholder="A, B"
                                />
                            </div>

                            <div className="pt-2 flex gap-2">
                                {editingId ? (
                                    <>
                                        <Button className="flex-1" size="sm" onClick={handleUpdateTask}>Update</Button>
                                        <Button variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
                                    </>
                                ) : (
                                    <Button className="w-full" size="sm" onClick={handleAddTask}>
                                        <Plus className="w-4 h-4 mr-1" /> Add Task
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSaveList} className="bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] text-white">
                        <Save className="w-4 h-4 mr-2" /> Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
