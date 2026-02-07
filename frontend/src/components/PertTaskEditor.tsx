import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Edit2, Save, Clock, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAppStore, type PertTask } from '../lib/store';
import { motion, AnimatePresence } from 'framer-motion';

interface PertTaskEditorProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PertTaskEditor({ isOpen, onClose }: PertTaskEditorProps) {
    const { pertTasks, setPertTasks } = useAppStore();
    const [tasks, setTasks] = useState<PertTask[]>([]);

    // Form Dialog State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<PertTask>({
        id: '',
        name: '',
        duration: 1,
        predecessors: []
    });
    const [predInput, setPredInput] = useState('');
    const [error, setError] = useState<string | null>(null);

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

    const handleOpenForm = (task?: PertTask) => {
        setError(null);
        if (task) {
            setEditingId(task.id);
            setFormData(task);
            setPredInput(task.predecessors.join(', '));
        } else {
            setEditingId(null);
            // Auto-generate ID
            const lastId = tasks.length > 0 ? tasks[tasks.length - 1].id : '';
            const nextId = lastId && /^[A-Z]$/.test(lastId)
                ? String.fromCharCode(lastId.charCodeAt(0) + 1)
                : '';

            setFormData({
                id: nextId,
                name: '',
                duration: 1,
                predecessors: []
            });
            setPredInput('');
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
        setError(null);
    };

    const handleSaveTask = () => {
        if (!formData.id || !formData.name) {
            setError('ID and Name are required');
            return;
        }

        const predecessors = predInput.split(',')
            .map(s => s.trim().toUpperCase())
            .filter(s => s);

        // Simple cycle detection (very basic: can't depend on self)
        if (predecessors.includes(formData.id)) {
            setError('Task cannot depend on itself');
            return;
        }

        const newTask = { ...formData, predecessors };

        if (editingId) {
            // Update existing
            if (formData.id !== editingId && tasks.some(t => t.id === formData.id)) {
                setError('Task ID must be unique');
                return;
            }

            setTasks(tasks.map(t => t.id === editingId ? newTask : t));
        } else {
            // Create new
            if (tasks.some(t => t.id === formData.id)) {
                setError('Task ID must be unique');
                return;
            }
            setTasks([...tasks, newTask]);
        }

        handleCloseForm();
    };

    const handleDeleteTask = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this task?')) {
            setTasks(tasks.filter(t => t.id !== id));
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-4xl bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl shadow-2xl flex flex-col h-[80vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] rounded-t-xl z-10">
                    <div>
                        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                            Project Tasks
                        </h2>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                            Define tasks, durations, and dependencies for PERT analysis
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button onClick={() => handleOpenForm()} className="bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] text-white gap-2">
                            <Plus className="w-4 h-4" /> Add Task
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Main Content - List */}
                <div className="flex-1 overflow-hidden bg-[var(--bg-base)] p-6">
                    <div className="h-full overflow-y-auto pr-2 space-y-3">
                        {tasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-[var(--border-subtle)] rounded-lg bg-[var(--bg-secondary)]/30">
                                <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mb-4 shadow-sm">
                                    <Plus className="w-8 h-8 text-[var(--text-tertiary)]" />
                                </div>
                                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">No tasks yet</h3>
                                <p className="text-[var(--text-tertiary)] mb-6 text-center max-w-sm">
                                    Start by adding your first project task. Define its duration and dependencies.
                                </p>
                                <Button onClick={() => handleOpenForm()} variant="outline">
                                    Create First Task
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {tasks.map(task => (
                                    <motion.div
                                        layoutId={task.id}
                                        key={task.id}
                                        onClick={() => handleOpenForm(task)}
                                        className="group relative p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--accent-blue-subtle)] hover:shadow-md transition-all cursor-pointer overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-gradient-to-l from-[var(--bg-elevated)] to-transparent pl-4">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-[var(--accent-red)] hover:text-[var(--accent-red)] hover:bg-[var(--accent-red-subtle)]"
                                                onClick={(e) => handleDeleteTask(task.id, e)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 shadow-inner">
                                                <span className="font-mono font-bold text-xl text-[var(--accent-blue)]">{task.id}</span>
                                            </div>
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <h4 className="font-medium text-[var(--text-primary)] truncate pr-6">{task.name}</h4>

                                                <div className="flex flex-col gap-1.5 mt-3">
                                                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                                        <Clock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                                                        <span className="font-medium">{task.duration} days</span>
                                                    </div>

                                                    {task.predecessors.length > 0 ? (
                                                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                                            <LinkIcon className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                                                            <div className="flex flex-wrap gap-1">
                                                                {task.predecessors.map(p => (
                                                                    <span key={p} className="px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[10px] font-mono">
                                                                        {p}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] opacity-60">
                                                            <LinkIcon className="w-3.5 h-3.5" />
                                                            <span>No dependencies</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)] flex justify-end gap-3 rounded-b-xl">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSaveList} className="bg-[var(--accent-green)] hover:bg-[var(--accent-green-hover)] text-white min-w-[140px] shadow-sm">
                        <Save className="w-4 h-4 mr-2" /> Save Changes
                    </Button>
                </div>

                {/* Nested Form Modal */}
                <AnimatePresence>
                    {isFormOpen && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                                onClick={handleCloseForm}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                transition={{ type: "spring", duration: 0.3 }}
                                className="w-full max-w-md bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl shadow-2xl overflow-hidden z-20"
                            >
                                <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-secondary)]/50">
                                    <h3 className="font-semibold text-[var(--text-primary)]">
                                        {editingId ? 'Edit Task' : 'New Task'}
                                    </h3>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={handleCloseForm}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="p-6 space-y-4">
                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="col-span-1 space-y-1.5">
                                            <Label htmlFor="taskId" className="text-xs font-medium text-[var(--text-secondary)]">ID</Label>
                                            <Input
                                                id="taskId"
                                                value={formData.id}
                                                onChange={e => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                                                placeholder="A"
                                                maxLength={3}
                                                className="font-mono text-center uppercase tracking-wider"
                                                autoFocus={!editingId}
                                            />
                                        </div>
                                        <div className="col-span-3 space-y-1.5">
                                            <Label htmlFor="taskName" className="text-xs font-medium text-[var(--text-secondary)]">Name</Label>
                                            <Input
                                                id="taskName"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g. Foundation"
                                                autoFocus={!!editingId}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="duration" className="text-xs font-medium text-[var(--text-secondary)]">Duration (days)</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-tertiary)]" />
                                            <Input
                                                id="duration"
                                                type="number"
                                                min="0"
                                                className="pl-9"
                                                value={formData.duration}
                                                onChange={e => setFormData({ ...formData, duration: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="preds" className="text-xs font-medium text-[var(--text-secondary)]">Predecessors</Label>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-tertiary)]" />
                                            <Input
                                                id="preds"
                                                value={predInput}
                                                onChange={e => setPredInput(e.target.value.toUpperCase())}
                                                placeholder="A, B"
                                                className="pl-9 font-mono uppercase"
                                            />
                                        </div>
                                        <p className="text-[10px] text-[var(--text-tertiary)]">
                                            Comma-separated IDs of tasks that must finish before this starts
                                        </p>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <Button variant="outline" className="flex-1" onClick={handleCloseForm}>
                                            Cancel
                                        </Button>
                                        <Button
                                            className="flex-1 bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] text-white"
                                            onClick={handleSaveTask}
                                        >
                                            {editingId ? 'Update' : 'Create'}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>,
        document.body
    );
}
