import React, { useState, useRef, useEffect } from 'react';
import { createStore, Store } from 'tinybase';
import { createIndexedDbPersister, Persister } from 'tinybase/persisters/persister-indexed-db';

import { Task, ConsoleOutput, NewTaskForm } from './types';
import { initialTasks } from './constants/initialTasks';
import { LoadingScreen } from './components/LoadingScreen';
import { Header } from './components/ui/Header';
import { TaskCard } from './components/ui/TaskCard';
import { TaskModal } from './components/TaskModal';
import { AddTaskModal } from './components/AddTaskModal';
import HomePage from './components/HomePage';

const App: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [code, setCode] = useState<string>('');
    const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput[]>([]);
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [newTask, setNewTask] = useState<NewTaskForm>({
        title: '',
        description: '',
        difficulty: 'Легка',
        test_code: '',
    });
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [syncing, setSyncing] = useState<boolean>(false);

    const storeRef = useRef<Store | null>(null);
    const persisterRef = useRef<Persister | null>(null);

    // Визначення мобільного пристрою
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Ініціалізація TinyBase
    useEffect(() => {
        const initTinyBase = async (): Promise<void> => {
            try {
                setLoading(true);
                const store = createStore();
                storeRef.current = store;

                const persister = createIndexedDbPersister(store, 'js-coding-tasks');
                persisterRef.current = persister;

                await persister.load();

                const existingTasks = store.getTable('tasks');
                if (!existingTasks || Object.keys(existingTasks).length === 0) {
                    store.setTable('tasks', initialTasks);
                    await persister.save();
                }

                await persister.startAutoSave();

                store.addTableListener('tasks', () => {
                    updateTasksList();
                });

                updateTasksList();
                setLoading(false);
            } catch (error) {
                console.error('Помилка ініціалізації TinyBase:', error);
                setLoading(false);
            }
        };

        initTinyBase();

        return () => {
            persisterRef.current?.stopAutoSave();
        };
    }, []);

    const updateTasksList = (): void => {
        if (storeRef.current) {
            const tasksTable = storeRef.current.getTable('tasks');
            const tasksArray: Task[] = Object.entries(tasksTable)
                .map(([id, task]) => ({ id, ...(task as Omit<Task, 'id'>) }))
                .sort((a, b) => a.created_at - b.created_at);
            setTasks(tasksArray);
        }
    };

    // Відкрити задачу
    const handleOpenTask = (task: Task): void => {
        setSelectedTask(task);
        setCode(task.solution || '');
        setConsoleOutput([]);
    };

    // Закрити задачу
    const handleCloseTask = (): void => {
        setSelectedTask(null);
        setCode('');
        setConsoleOutput([]);
    };

    // Запустити код
    const handleRunCode = (): void => {
        if (!selectedTask) return;

        const output: ConsoleOutput[] = [];

        // Перехоплюємо console
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args) => {
            output.push({ type: 'log', content: args.map(String).join(' ') });
        };
        console.error = (...args) => {
            output.push({ type: 'error', content: args.map(String).join(' ') });
        };
        console.warn = (...args) => {
            output.push({ type: 'warn', content: args.map(String).join(' ') });
        };

        try {
            const fullCode = `${code}\n${selectedTask.test_code}`;
            // eslint-disable-next-line no-new-func
            new Function(fullCode)();
        } catch (err) {
            output.push({ type: 'error', content: String(err) });
        } finally {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
        }

        setConsoleOutput(output);
    };

    // Зберегти рішення
    const handleSaveCode = async (): Promise<void> => {
        if (!selectedTask || !storeRef.current) return;
        setSyncing(true);

        storeRef.current.setRow('tasks', selectedTask.id, {
            ...selectedTask,
            solution: code,
            completed: true,
            updated_at: Date.now(),
        });

        await new Promise(r => setTimeout(r, 500));
        setSyncing(false);
    };

    // Видалити задачу
    const handleDeleteTask = (taskId: string): void => {
        if (!storeRef.current) return;
        storeRef.current.delRow('tasks', taskId);
    };

    // Додати нову задачу
    const handleAddTask = async (): Promise<void> => {
        if (!newTask.title.trim() || !storeRef.current) return;
        setSyncing(true);

        const id = `task_${Date.now()}`;
        storeRef.current.setRow('tasks', id, {
            ...newTask,
            solution: '',
            completed: false,
            created_at: Date.now(),
        });

        setNewTask({ title: '', description: '', difficulty: 'Легка', test_code: '' });
        setShowAddModal(false);
        await new Promise(r => setTimeout(r, 300));
        setSyncing(false);
    };

    // Синхронізація (примусове збереження)
    const handleSync = async (): Promise<void> => {
        if (!persisterRef.current) return;
        setSyncing(true);
        await persisterRef.current.save();
        await new Promise(r => setTimeout(r, 500));
        setSyncing(false);
    };

    // Експорт у JSON
    const handleExport = (): void => {
        const data = JSON.stringify(tasks, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tasks.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    // Імпорт із JSON
    const handleImport = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0];
        if (!file || !storeRef.current) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported: Task[] = JSON.parse(e.target?.result as string);
                imported.forEach((task) => {
                    const { id, ...rest } = task;
                    storeRef.current!.setRow('tasks', id, rest);
                });
            } catch {
                alert('Помилка читання файлу');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 md:p-6">
            <div className="max-w-4xl mx-auto">
                <Header
                    isMobile={isMobile}
                    syncing={syncing}
                    onSync={handleSync}
                    onExport={handleExport}
                    onImport={handleImport}
                    onAddTask={() => setShowAddModal(true)}
                />
                <HomePage/>

                {/* Список задач */}
                <div className="flex flex-col gap-3">
                    {tasks.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            Задач немає. Додайте першу!
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onOpen={handleOpenTask}
                                onDelete={handleDeleteTask}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Модал задачі */}
            <TaskModal
                task={selectedTask}
                code={code}
                setCode={setCode}
                consoleOutput={consoleOutput}
                onClose={handleCloseTask}
                onSave={handleSaveCode}
                onRun={handleRunCode}
                isMobile={isMobile}
                syncing={syncing}
            />

            {/* Модал додавання */}
            <AddTaskModal
                show={showAddModal}
                newTask={newTask}
                setNewTask={setNewTask}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddTask}
                syncing={syncing}
            />
        </div>
    );
};

export default App;