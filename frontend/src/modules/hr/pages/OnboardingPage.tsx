import { useState, useEffect } from 'react';
import hrService, { type OnboardingTask, type EmpleadoLite, type EmployeeRow } from '../../../core/services/hrService';
import { CheckCircle, Circle, Plus, X, AlertCircle, Calendar, Trash2, Users } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import EmployeeSelector from '../components/EmployeeSelector';

export default function OnboardingPage() {
    const [tasks, setTasks] = useState<OnboardingTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [empleados, setEmpleados] = useState<EmpleadoLite[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
    const [selectorOpen, setSelectorOpen] = useState(false);
    const [selectedEmployeeInfo, setSelectedEmployeeInfo] = useState<EmployeeRow | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<OnboardingTask>>({
        title: '',
        due_date: '',
        is_completed: false,
    });

    useEffect(() => {
        loadEmployees();
    }, []);

    useEffect(() => {
        if (selectedEmployee) {
            loadTasks(selectedEmployee);
        }
    }, [selectedEmployee]);

    const loadEmployees = async () => {
        try {
            const data = await hrService.getEmployeesLite();
            setEmpleados(data);
            if (data.length > 0) {
                setSelectedEmployee(data[0].id);
            }
        } catch (err) {
            console.error(err);
            setError('Error al cargar empleados.');
        }
    };

    const loadTasks = async (employeeId: number) => {
        try {
            setLoading(true);
            const data = await hrService.getOnboardingTasks(employeeId);
            setTasks(data);
        } catch (err) {
            console.error(err);
            setError('Error al cargar las tareas de onboarding.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleTask = async (taskId: number) => {
        try {
            const updatedTask = await hrService.toggleOnboardingTask(taskId);
            setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
            setSuccessMsg('Tarea actualizada correctamente.');
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            console.error(err);
            setError('Error al actualizar la tarea.');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        if (!window.confirm('¿Estás seguro de eliminar esta tarea?')) return;
        
        try {
            await hrService.deleteOnboardingTask(taskId);
            setTasks(tasks.filter(t => t.id !== taskId));
            setSuccessMsg('Tarea eliminada correctamente.');
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            console.error(err);
            setError('Error al eliminar la tarea.');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.title || !formData.due_date || !selectedEmployee) {
            setError('Por favor completa todos los campos obligatorios.');
            return;
        }

        try {
            const newTask = await hrService.createOnboardingTask({
                title: formData.title,
                due_date: formData.due_date,
                employee: selectedEmployee,
                is_completed: false
            });
            setTasks([...tasks, newTask]);
            setIsModalOpen(false);
            setFormData({ title: '', due_date: '', is_completed: false });
            setSuccessMsg('Tarea creada correctamente.');
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            console.error(err);
            setError('Error al crear la tarea.');
        }
    };

    const calculateProgress = () => {
        if (tasks.length === 0) return 0;
        const completed = tasks.filter(t => t.is_completed).length;
        return Math.round((completed / tasks.length) * 100);
    };

    const getTaskStatus = (task: OnboardingTask) => {
        if (task.is_completed) return 'completed';
        if (!task.due_date) return 'pending';
        const daysLeft = differenceInDays(parseISO(task.due_date), new Date());
        if (daysLeft < 0) return 'overdue';
        if (daysLeft <= 3) return 'urgent';
        return 'pending';
    };

    const completedTasks = tasks.filter(t => t.is_completed);
    const pendingTasks = tasks.filter(t => !t.is_completed);
    const progress = calculateProgress();

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Onboarding</h1>
                    <p className="text-gray-600 mt-1">Gestión de tareas de inducción</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={() => setSelectorOpen(true)}
                        className="px-3 py-2 border border-gray-300 rounded-lg bg-white flex items-center gap-2 text-sm hover:border-indigo-400"
                    >
                        <Users className="w-4 h-4 text-indigo-600" />
                        {selectedEmployeeInfo?.nombre_completo || empleados.find(e => e.id === selectedEmployee)?.nombre_completo || 'Elegir empleado'}
                    </button>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        {selectedEmployeeInfo?.cargo_nombre || 'Cargo no asignado'} · {selectedEmployeeInfo?.sucursal_nombre || 'Sucursal no asignada'}
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Nueva Tarea
                    </button>
                </div>

            </div>

            {/* Messages */}
            {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}
            {successMsg && (
                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {successMsg}
                </div>
            )}

            {/* Progress Bar */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold text-gray-800">Progreso General</h2>
                    <span className="text-2xl font-bold text-indigo-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                    {completedTasks.length} de {tasks.length} tareas completadas
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pending Tasks */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <Circle className="w-5 h-5 mr-2 text-yellow-500" />
                            Tareas Pendientes ({pendingTasks.length})
                        </h2>
                        <div className="space-y-3">
                            {pendingTasks.length > 0 ? (
                                pendingTasks.map(task => {
                                    const status = getTaskStatus(task);
                                    return (
                                        <div
                                            key={task.id}
                                            className={`p-4 rounded-lg border-l-4 ${
                                                status === 'overdue'
                                                    ? 'bg-red-50 border-red-500'
                                                    : status === 'urgent'
                                                    ? 'bg-orange-50 border-orange-500'
                                                    : 'bg-gray-50 border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <button
                                                            onClick={() => handleToggleTask(task.id!)}
                                                            className="text-gray-400 hover:text-green-500 transition-colors"
                                                        >
                                                            <Circle className="w-5 h-5" />
                                                        </button>
                                                        <h3 className="font-medium text-gray-800">{task.title}</h3>
                                                    </div>
                                                    {task.due_date && (
                                                        <div className="flex items-center gap-1 text-sm text-gray-600 ml-7">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>
                                                                Vence: {format(parseISO(task.due_date), 'dd MMM yyyy', { locale: es })}
                                                            </span>
                                                            {status === 'overdue' && (
                                                                <span className="text-red-600 font-semibold ml-2">(Vencida)</span>
                                                            )}
                                                            {status === 'urgent' && (
                                                                <span className="text-orange-600 font-semibold ml-2">(Urgente)</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteTask(task.id!)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-500 text-center py-8">No hay tareas pendientes</p>
                            )}
                        </div>
                    </div>

                    {/* Completed Tasks */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                            Tareas Completadas ({completedTasks.length})
                        </h2>
                        <div className="space-y-3">
                            {completedTasks.length > 0 ? (
                                completedTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <button
                                                        onClick={() => handleToggleTask(task.id!)}
                                                        className="text-green-500 hover:text-gray-400 transition-colors"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <h3 className="font-medium text-gray-800 line-through">{task.title}</h3>
                                                </div>
                                                {task.due_date && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600 ml-7">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>
                                                            {format(parseISO(task.due_date), 'dd MMM yyyy', { locale: es })}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteTask(task.id!)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">Ninguna tarea completada aún</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Adding New Task */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Nueva Tarea de Onboarding</h2>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setFormData({ title: '', due_date: '', is_completed: false });
                                    setError(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Título de la Tarea *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title || ''}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Ej: Completar formularios de RRHH"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha de Vencimiento *
                                </label>
                                <input
                                    type="date"
                                    value={formData.due_date || ''}
                                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setFormData({ title: '', due_date: '', is_completed: false });
                                        setError(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Crear Tarea
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

                        <EmployeeSelector
                            open={selectorOpen}
                            onClose={() => setSelectorOpen(false)}
                            initialId={selectedEmployee}
                            onSelect={(emp) => {
                                setSelectedEmployee(emp.id);
                                setSelectedEmployeeInfo(emp);
                                setSelectorOpen(false);
                            }}
                        />
        </div>
    );
}
