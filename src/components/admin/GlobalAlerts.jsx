// src/components/admin/GlobalAlerts.jsx
import { useEffect, Fragment } from 'react';
import { Transition } from '@headlessui/react';
import useAlertStore from '../../store/useAlertStore';
import { BsCheckCircleFill, BsInfoCircleFill, BsExclamationTriangleFill, BsXCircleFill, BsX } from 'react-icons/bs';

const AlertItem = ({ alert, removeAlert }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            removeAlert(alert.id);
        }, alert.duration);
        return () => clearTimeout(timer);
    }, [alert, removeAlert]);

    // Estilos limpios y profesionales con fondos sólidos bien diferenciados
    const styles = {
        success: { icon: BsCheckCircleFill, bg: 'bg-brand-green', text: 'text-white', iconColor: 'text-white' },
        error: { icon: BsXCircleFill, bg: 'bg-brand-red', text: 'text-white', iconColor: 'text-white' },
        warning: { icon: BsExclamationTriangleFill, bg: 'bg-brand-yellow', text: 'text-white', iconColor: 'text-white' },
        info: { icon: BsInfoCircleFill, bg: 'bg-brand-blue', text: 'text-white', iconColor: 'text-white' },
    };

    const theme = styles[alert.type] || styles.info;
    const Icon = theme.icon;

    return (
        <Transition
            show={true}
            appear={true}
            as={Fragment}
            enter="transform transition ease-out duration-300"
            enterFrom="translate-y-[-100%] opacity-0"
            enterTo="translate-y-0 opacity-100"
            leave="transform transition ease-in duration-200"
            leaveFrom="translate-y-0 opacity-100"
            leaveTo="translate-y-[-100%] opacity-0"
        >
            <div
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl ${theme.bg} ${theme.text}`}
                style={{ width: '25vw', minWidth: '300px', maxWidth: '400px', borderRadius: '1.25rem', border: '1px solid #e2e8f0' }}
            >
                <Icon className={`flex-shrink-0 text-xl mt-0.5 ${theme.iconColor}`} />

                <div className="flex-1 flex flex-col text-left">
                    <h4 className="text-sm font-bold m-0 p-0 leading-tight">{alert.title}</h4>
                    {alert.subtitle && (
                        <p className="text-xs mt-1 opacity-90 m-0 p-0 leading-snug">{alert.subtitle}</p>
                    )}
                </div>

                <button
                    onClick={() => removeAlert(alert.id)}
                    className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity bg-transparent border-none outline-none p-0 cursor-pointer text-white"
                >
                    <BsX size={20} />
                </button>
            </div>
        </Transition>
    );
};

const GlobalAlerts = () => {
    const { alerts, removeAlert } = useAlertStore();

    const topCenterAlerts = alerts.filter(a => a.position === 'top-center');

    return (
        // Posicionamiento superior centrado con Z-index extremo
        <div
            className="fixed top-6 left-1/2 -translate-x-1/2 flex flex-col gap-3 pointer-events-none items-center"
            style={{ zIndex: 9999999, width: 'auto', borderRadius: '1.25rem', border: '1px solid #e2e8f0' }}
        >
            {topCenterAlerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} removeAlert={removeAlert} />
            ))}
        </div>
    );
};

export default GlobalAlerts;