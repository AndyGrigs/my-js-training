import React, { useState, useRef, useEffect } from 'react';
import { createStore, Store } from 'tinybase';
import { createIndexedDbPersister, Persister } from 'tinybase/persisters/persister-indexed-db';

// Імпортуємо типи
import { Task, ConsoleOutput, NewTaskForm } from './types';

// Імпортуємо константи
import { initialTasks } from './constants/initialTasks';

// Імпортуємо компоненти
import { LoadingScreen } from './components/LoadingScreen';
import { Header } from './components/ui/Header';
import { TaskCard } from './components/ui/TaskCard';
import { TaskModal } from './components/TaskModal';
import { AddTaskModal } from './components/AddTaskModal';
import { Database } from 'lucide-react';

const App: React.FC = () => {
    // Стан для задач
    const [tasks, setTasks] = useState<Task[]>([]);

    // Стан для модального вікна задачі
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [code, setCode] = useState<string>('');
    const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput[]>([]);

    // Стан для модального вікна додавання
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [newTask, setNewTask] = useState<NewTaskForm>({
        title: '',
        description: '',
        difficulty: 'Легко',
        test_code: '',
    });

    // Стан інтерфейсу
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [syncing, setSyncing] = useState<boolean>(false);

    // Refs для TinyBase
    const storeRef = useRef<Store | null>(null);
    const persisterRef = useRef<Persister | null>(null);

    // Ініціалізація TinyBase
    useEffect(() => {
        const initTinyBase = async (): Promise<void> => {
            try {
                setLoading(true);

                // 1. Створюємо store
                const store = createStore();
                storeRef.current = store;

                // 2. Створюємо persister для IndexedDB
                const persister = createIndexedDbPersister(store, 'js-coding-tasks');
                persisterRef.current = persister;

                // 3. Завантажуємо дані з IndexedDB
                await persister.load();

                // 4. Якщо немає даних, додаємо початкові задачі
                const existingTasks = store.getTable('tasks');
                if (!existingTasks || Object.keys(existingTasks).length === 0) {
                    store.setTable('tasks', initialTasks);
                    await persister.save();
                }

                // 5. Запускаємо автоматичне збереження
                await persister.startAutoSave();

                // 6. Підписуємося на зміни
                store.addTableListener('tasks', () => {
                    updateTasksList();
                });

                // 7. Оновлюємо список задач
                updateTasksList();

                setLoading(false);
            } catch (error) {
                console.error('Помилка ініціалізації TinyBase:', error);
                setLoading(false);
            }
        };

        initTinyBase();

        // Cleanup при розмонтуванні
        return () => {
            if (persisterRef.current) {
                persisterRef.current.stopAutoSave();
            }
        };
    }, []);

    // Функція для оновлення списку задач
    const updateTasksList = (): void => {
        if (storeRef.current) {
            const tasksTable = storeRef.current.getTable('tasks');
            const tasksArray: Task[] = Object.entries(tasksTable)
                .map(([id, task]) => ({
                    id,
                    ...(task as Omit<Task, 'id'>),
                }))
                .sort((a, b) => a.created_at - b.created_at);
            setTasks(tasksArray);
        }
    };

    return <div>App компонент</div>;
};

export default App;
