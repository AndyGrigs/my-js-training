import React, { ChangeEvent } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { NewTaskForm } from '../types';

interface AddTaskModalProps {
    show: boolean;
    newTask: NewTaskForm;
    setNewTask: (task: NewTaskForm) => void;
    onClose: () => void;
    onAdd: () => void;
    syncing: boolean;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
    show,
    newTask,
    setNewTask,
    onClose,
    onAdd,
    syncing,
}) => {
    // Якщо show === false, не показуємо модал
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                {/* Шапка */}
                <div className="flex justify-between items-center p-4 md:p-6 border-b sticky top-0 bg-white">
                    <h2 className="text-lg md:text-2xl font-bold text-gray-800">
                        Додати нову задачу
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Тут буде форма */}
                <div className="p-4 md:p-6">
                    {/* Поле 1: Назва задачі */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Назва задачі
                        </label>
                        <input
                            type="text"
                            value={newTask.title}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setNewTask({ ...newTask, title: e.target.value })
                            }
                            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                            placeholder="Наприклад: Знайти максимальне число"
                        />
                    </div>

                    {/* Поле 2: Опис */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Опис</label>
                        <textarea
                            value={newTask.description}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                                setNewTask({ ...newTask, description: e.target.value })
                            }
                            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                            rows={3}
                            placeholder="Опишіть завдання..."
                        />
                    </div>

                    {/* Поле 3: Складність */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Складність
                        </label>
                        <select
                            value={newTask.difficulty}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                setNewTask({
                                    ...newTask,
                                    difficulty: e.target.value as NewTaskForm['difficulty'],
                                })
                            }
                            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                        >
                            <option>Легка</option>
                            <option>Середня</option>
                            <option>Важка</option>
                        </select>
                    </div>

                    {/* Поле 4: Тестовий код */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Тестовий код
                        </label>
                        <textarea
                            value={newTask.test_code}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                                setNewTask({ ...newTask, test_code: e.target.value })
                            }
                            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-xs md:text-sm"
                            rows={4}
                            placeholder="console.log(yourFunction(5));"
                        />
                    </div>
                </div>

                {/* Футер */}
                <div className="p-4 md:p-6 border-t flex justify-end gap-2 md:gap-3 sticky bottom-0 bg-white">
                    <button
                        onClick={onClose}
                        className="px-4 md:px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
                    >
                        Скасувати
                    </button>

                    <button
                        onClick={onAdd}
                        disabled={syncing}
                        className="px-4 md:px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm md:text-base disabled:opacity-50 flex items-center gap-2"
                    >
                        {syncing && <RefreshCw size={16} className="animate-spin" />}
                        Додати
                    </button>
                </div>
            </div>
        </div>
    );
};
